import crypto from 'node:crypto'
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { createPrismaClient } from '@postilion/db/edge'
import { generateObject } from 'ai'
import { customAlphabet } from 'nanoid'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

export const generateShortId = () => {
  const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

  return createId()
}

// User-defined params passed to your workflow
type Params = {
  from: string
  to: string
  subject: string
  content: string
  attachments: Array<{
    filename: string
    mimeType: string
    content: string
  }>
}

export class InboundEmailWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const prisma = createPrismaClient(this.env.DATABASE_URL)

    const project = await step.do('Get the project from the database', async () => {
      const toEmail = event.payload.to

      if (toEmail.endsWith('@postilion.ai')) {
        const [shortId] = toEmail.split('@')

        const projectFromShortId = await step.do('Get project by short id', async () => {
          const project = await prisma.project
            .findUnique({
              where: {
                short_id: shortId,
              },
              select: {
                id: true,
                name: true,
                slug: true,
                team: {
                  select: {
                    id: true,
                    slug: true,
                  },
                },
              },
            })
            .catch((error) => {
              console.error(error)
              throw new Error('Error fetching project')
            })

          if (!project) {
            throw new NonRetryableError('Project not found')
          }

          return project
        })

        return projectFromShortId
      }

      const projectFromDomain = await step.do('Get project by domain', async () => {
        const toDomain = event.payload.to.split('@')[1]

        const domain = await prisma.domain
          .findUnique({
            where: {
              domain: toDomain,
            },
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  team: {
                    select: {
                      id: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          })
          .catch((error) => {
            console.error(error)
            throw new Error('Error fetching domain')
          })

        if (!domain) {
          throw new NonRetryableError(`Domain ${toDomain} not found`)
        }

        if (!domain.project) {
          throw new NonRetryableError(`Domain ${toDomain} is not associated with any project`)
        }

        return domain.project
      })

      return projectFromDomain
    })

    const createdMessage = await step.do('Create a new message in the database', async () => {
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const createdMessage = await prisma.message.create({
        data: {
          project_id: project.id,
          slug: Math.random().toString(36).substring(2, 15),
          handle: event.payload.to.split('@')[0],
          from: event.payload.from.trim(),
          body_raw: event.payload.content.trim(),
          subject: event.payload.subject.trim(),
          status: 'PROCESSING',
        },
        include: {
          attachments: true,
          webhook_logs: true,
          project: {
            select: {
              webhooks: true,
            },
          },
        },
      })

      const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
      const statusObj = this.env.MESSAGE_STATUS.get(id)

      try {
        await statusObj.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify(createdMessage),
        })
      } catch (error) {
        console.error('Failed to broadcast message:', error)
      }

      return createdMessage
    })

    const strippedBody = await step.do('Get a stripped body of the email', async () => {
      const workersai = createWorkersAI({ binding: this.env.AI })
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const { object } = await generateObject({
        model: workersai('@cf/meta/llama-3.1-8b-instruct'),
        system: `You are a helpful assistant that analyzes email HTML and returns a stripped clean text version of the email body.
  * Analyze this and give me a version where all the HTML is removed.
  * Remove any irrelevant information such as copyrights, footers, unsubscribe links/texts etc.
  * Send the response as a string without any format (no markup, no markdown etc, only pure text).
  * ONLY respond with the parsed text without any prefixes about "Here is your desired results" or similar.`,
        schema: z.object({
          strippedBody: z.string().describe('A stripped body of the email without any markup'),
        }),
        messages: [
          {
            role: 'user',
            content: event.payload.content,
          },
        ],
      })

      await prisma.message.update({
        where: {
          id: createdMessage.id,
        },
        data: {
          body_stripped: object.strippedBody,
        },
      })

      return object.strippedBody
    })

    await step.do('Process attachments', async () => {
      if (event.payload.attachments.length === 0) {
        return []
      }

      // Upload attachments to R2
      const attachmentData = await Promise.all(
        event.payload.attachments.map(async (attachment) => {
          const fileKey = `${createdMessage.id}-${generateShortId()}-${attachment.filename}`

          // Convert base64 to buffer
          const fileBuffer = Buffer.from(attachment.content, 'base64')

          const r2Object = await this.env.ATTACHMENTS.put(fileKey, fileBuffer, {
            httpMetadata: {
              contentType: attachment.mimeType,
            },
          })

          return {
            messageId: createdMessage.id,
            filename: attachment.filename,
            mimeType: attachment.mimeType,
            r2Key: r2Object.key,
          }
        }),
      )

      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const updatedMessage = await prisma.message
        .update({
          where: {
            id: createdMessage.id,
          },
          data: {
            attachments: {
              createMany: {
                data: attachmentData.map((attachment) => ({
                  filename: attachment.filename,
                  mime_type: attachment.mimeType,
                  r2_key: attachment.r2Key,
                })),
              },
            },
          },
          include: {
            attachments: true,
            webhook_logs: true,
            project: {
              select: {
                webhooks: true,
              },
            },
          },
        })
        .catch((error) => {
          console.error(error)
          throw new Error('Error creating attachments')
        })

      try {
        const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
        const statusObj = this.env.MESSAGE_STATUS.get(id)

        await statusObj.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify(updatedMessage),
        })
      } catch (error) {
        console.error('Failed to broadcast message:', error)
      }
    })

    await step.do('Generate a summary of the stripped email body', async () => {
      const workersai = createWorkersAI({ binding: this.env.AI })
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const { object } = await generateObject({
        model: workersai('@cf/meta/llama-3.1-8b-instruct'),
        system:
          'You are a helpful assistant that summarizes an email. You will be given a body of an email and you will need to summarize it in a few sentences. ONLY respond with the parsed text without any prefixes about "Here is your desired results" or similar.',
        schema: z.object({
          summary: z.string().describe('A summary of the email'),
        }),
        messages: [
          {
            role: 'user',
            content: strippedBody,
          },
        ],
      })

      const updatedMessage = await prisma.message.update({
        where: {
          id: createdMessage.id,
        },
        data: {
          body_ai_summary: object.summary,
        },
        include: {
          attachments: true,
          webhook_logs: true,
          project: {
            select: {
              webhooks: true,
            },
          },
        },
      })

      const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
      const statusObj = this.env.MESSAGE_STATUS.get(id)

      try {
        await statusObj.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify(updatedMessage),
        })
      } catch (error) {
        console.error('Failed to broadcast message:', error)
      }

      return object.summary
    })

    const { webhooks, message } = await step.do('Get associated webhooks', async () => {
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const message = await prisma.message
        .findUnique({
          where: {
            id: createdMessage.id,
          },
          include: {
            attachments: true,
          },
        })
        .catch((error) => {
          console.error(error)
          throw new Error('Error fetching message')
        })

      if (!message) {
        throw new NonRetryableError('Message not found')
      }

      const webhooks = await prisma.webhook
        .findMany({
          where: {
            project_id: project.id,
          },
        })
        .catch((error) => {
          console.error(error)
          throw new Error('Error fetching webhooks')
        })

      if (!webhooks || webhooks.length === 0) {
        // biome-ignore lint/suspicious/noConsoleLog: <explanation>
        console.log('No webhooks found for project')
        return { webhooks: [], message }
      }

      return { webhooks, message }
    })

    await step.do('Process webhooks', async () => {
      for (const webhook of webhooks) {
        await step
          .do(
            `Process webhook ${webhook.method}: ${webhook.url}`,
            {
              retries: {
                limit: 3,
                delay: this.env.DEV ? '2 seconds' : '30 seconds',
                backoff: 'exponential',
              },
            },
            async () => {
              const prisma = createPrismaClient(this.env.DATABASE_URL)
              const url = webhook.url.replace('{subject}', message.subject).replace('{handle}', message.handle ?? '')
              webhook.url = encodeURI(url)

              if (webhook.method === 'POST' || webhook.method === 'PUT') {
                const attachments = (
                  await Promise.all(
                    message.attachments.map(async (attachment) => {
                      const r2Object = await this.env.ATTACHMENTS.get(attachment.r2_key)

                      if (!r2Object) {
                        return
                      }

                      const buffer = await r2Object.arrayBuffer()

                      return {
                        filename: attachment.filename,
                        mimeType: attachment.mime_type,
                        content: buffer,
                      }
                    }),
                  )
                ).filter((attachment) => attachment !== undefined)

                const payload = {
                  handle: message.handle,
                  from: message.from,
                  subject: message.subject,
                  body: {
                    raw: message.body_raw,
                    stripped: message.body_stripped,
                    summary: message.body_ai_summary,
                  },
                  attachments,
                }

                const signature = crypto
                  .createHmac('sha256', webhook.signing_key)
                  .update(JSON.stringify(payload))
                  .digest('hex')

                const response = await fetch(webhook.url, {
                  method: webhook.method,
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Postilion-Signature': signature,
                  },
                  body: JSON.stringify(payload),
                }).catch((error) => {
                  throw new Error(`Webhook request failed: ${error.message}`)
                })

                if (!response.ok) {
                  throw new Error(`Webhook failed with status ${response.status}`)
                }

                await prisma.webhookLog.create({
                  data: {
                    status: 'SUCCESS',
                    message_id: message.id,
                    url: webhook.url,
                    method: webhook.method,
                  },
                })
              }

              if (webhook.method === 'GET' || webhook.method === 'DELETE') {
                const signature = crypto.createHmac('sha256', webhook.signing_key).update(webhook.url).digest('hex')

                const response = await fetch(webhook.url, {
                  method: webhook.method,
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Postilion-Signature': signature,
                  },
                }).catch((error) => {
                  throw new Error(`Webhook request failed: ${error.message}`)
                })

                if (!response.ok) {
                  throw new Error(`Webhook failed with status ${response.status}`)
                }

                await prisma.webhookLog.create({
                  data: {
                    status: 'SUCCESS',
                    message_id: message.id,
                    url: webhook.url,
                    method: webhook.method,
                  },
                })
              }
            },
          )
          .catch(async (error) => {
            const prisma = createPrismaClient(this.env.DATABASE_URL)

            await prisma.webhookLog.create({
              data: {
                status: 'FAILED',
                message_id: message.id,
                url: webhook.url,
                method: webhook.method,
              },
            })

            console.error(`Webhook ${webhook.url} failed after retries:`, error)
          })
      }
    })

    // Final status update
    await step.do('Finalize message status', async () => {
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      // Count successful webhooks
      const successfulWebhooks = await prisma.webhookLog.count({
        where: {
          message_id: createdMessage.id,
          status: 'SUCCESS',
        },
      })

      // Compare with total number of webhooks that should have run
      const allWebhooksSuccessful = successfulWebhooks === webhooks.length

      const updatedMessage = await prisma.message.update({
        where: {
          id: message.id,
        },
        data: {
          status: allWebhooksSuccessful ? 'COMPLETED' : 'FAILED',
        },
        include: {
          attachments: true,
          webhook_logs: true,
          project: {
            select: {
              webhooks: true,
            },
          },
        },
      })

      const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
      const statusObj = this.env.MESSAGE_STATUS.get(id)

      try {
        await statusObj.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify(updatedMessage),
        })
      } catch (error) {
        console.error('Failed to broadcast final message status:', error)
      }

      return updatedMessage
    })
  }
}
