import type { WorkflowEvent } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { MESSAGE_SELECT } from '@postilion/db/constants'
import { createPrismaClient } from '@postilion/db/edge'
import { generateObject } from 'ai'
import { customAlphabet } from 'nanoid'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'
import type { WorkflowParams } from '../inbound-workflow'
import { executeGetOrDelete, executePostOrPut, getAttachments, getFreshMessageAndBroadcast } from '../utils'

type Event = WorkflowEvent<WorkflowParams>

export type ReturnOfMethod<T extends keyof StepFactory> = Awaited<
  ReturnType<Awaited<ReturnType<ReturnType<StepFactory[T]>['fn']>>>
>

type Project = ReturnOfMethod<'getProject'>
type CreatedMessage = ReturnOfMethod<'createMessage'>
type StrippedBody = ReturnOfMethod<'stripBody'>
type Webhook = ReturnOfMethod<'getAssociatedWebhooks'>['webhooks'][number]
type Message = ReturnOfMethod<'getAssociatedWebhooks'>['message']

const generateShortId = () => {
  const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

  return createId()
}

export class StepFactory {
  constructor(
    private env: Env,
    private event: Event,
  ) {}

  getProject() {
    const [shortId, domainName] = this.event.payload.to.split('@')

    if (domainName === 'postilion.ai') {
      return {
        description: `Get project by shortId: ${shortId}` as const,
        fn: () => {
          return async () => {
            const prisma = createPrismaClient(this.env.DATABASE_URL)

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
          }
        },
      }
    }

    return {
      description: `Get project by domain: ${domainName}` as const,
      fn: () => {
        return async () => {
          const prisma = createPrismaClient(this.env.DATABASE_URL)
          const domain = await prisma.domain
            .findUnique({
              where: {
                domain: domainName,
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
            throw new NonRetryableError(`Domain ${domainName} not found`)
          }

          if (!domain.project) {
            throw new NonRetryableError(`Domain ${domainName} is not associated with any project`)
          }

          return domain.project
        }
      },
    }
  }

  createMessage({ project }: { project: Project }) {
    return {
      description: 'Create a new message in the database',
      fn: () => {
        return async () => {
          const prisma = createPrismaClient(this.env.DATABASE_URL)

          const createdMessage = await prisma.message.create({
            data: {
              project_id: project.id,
              slug: Math.random().toString(36).substring(2, 15),
              handle: this.event.payload.to.split('@')[0],
              from: this.event.payload.from.trim(),
              body_raw: this.event.payload.content.trim(),
              body_text: this.event.payload.contentText ? this.event.payload.contentText.trim() : undefined,
              subject: this.event.payload.subject.trim(),
              status: 'PENDING',
            },
            select: MESSAGE_SELECT,
          })

          const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
          const statusObj = this.env.MESSAGE_STATUS.get(id)

          await statusObj.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify(createdMessage),
          })

          return createdMessage
        }
      },
    }
  }

  stripBody({ createdMessage }: { createdMessage: CreatedMessage }) {
    return {
      description: 'Get a stripped body of the email',
      fn: () => {
        return async () => {
          const prisma = createPrismaClient(this.env.DATABASE_URL)

          const workersai = createWorkersAI({ binding: this.env.AI })

          const { object } = await generateObject({
            model: workersai('@cf/meta/llama-3.3-70b-instruct-fp8-fast'),
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
                content: this.event.payload.content,
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
        }
      },
    }
  }

  processAttachments({
    createdMessage,
    project,
  }: {
    createdMessage: CreatedMessage
    project: Project
  }) {
    return {
      description: 'Process attachments',
      fn: () => {
        return async () => {
          if (this.event.payload.attachments.length === 0) {
            return []
          }

          // Upload attachments to R2
          const attachmentData = await Promise.all(
            this.event.payload.attachments.map(async (attachment) => {
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
                buffer: fileBuffer,
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
              select: MESSAGE_SELECT,
            })
            .catch((error) => {
              console.error(error)
              throw new Error('Error creating attachments')
            })

          const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
          const statusObj = this.env.MESSAGE_STATUS.get(id)

          await statusObj.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify(updatedMessage),
          })
        }
      },
    }
  }

  generateSummary({
    strippedBody,
    createdMessage,
    project,
  }: {
    strippedBody: StrippedBody
    createdMessage: CreatedMessage
    project: Project
  }) {
    return {
      description: 'Generate a summary of the stripped email body',
      fn: () => {
        return async () => {
          const workersai = createWorkersAI({ binding: this.env.AI })

          const { object } = await generateObject({
            model: workersai('@cf/meta/llama-3.3-70b-instruct-fp8-fast'),
            system:
              'You are a helpful assistant that summarizes an email. You will be given a body of an email and you will need to summarize it in a few sentences. ONLY respond with the parsed text without any prefixes about "Here is your desired results" or similar.',
            schema: z.object({
              summary: z.string().describe('A summary of the email'),
            }),
            messages: [
              {
                role: 'user',
                content: `The subject of the email is: ${this.event.payload.subject}`,
              },
              {
                role: 'user',
                content: `The text body of the email is: ${this.event.payload.contentText}`,
              },
              {
                role: 'user',
                content: strippedBody,
              },
            ],
          })

          const prisma = createPrismaClient(this.env.DATABASE_URL)

          const updatedMessage = await prisma.message.update({
            where: {
              id: createdMessage.id,
            },
            data: {
              body_ai_summary: object.summary,
            },
            select: MESSAGE_SELECT,
          })

          const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
          const statusObj = this.env.MESSAGE_STATUS.get(id)

          await statusObj.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify(updatedMessage),
          })

          return object.summary
        }
      },
    }
  }

  getAssociatedWebhooks({ project, createdMessage }: { project: Project; createdMessage: CreatedMessage }) {
    return {
      description: 'Get associated webhooks',
      fn: () => {
        return async () => {
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
        }
      },
    }
  }

  processWebhook({ webhook, message, project }: { webhook: Webhook; message: Message; project: Project }) {
    return {
      description: `Process webhook ${webhook.method}: ${webhook.url}`,
      fn: () => {
        return async () => {
          const prisma = createPrismaClient(this.env.DATABASE_URL)

          const url = webhook.url.replace('{subject}', message.subject).replace('{handle}', message.handle ?? '')
          const encodedUrl = new URL(url).href
          webhook.url = encodedUrl

          // Use upsert to create or update the webhook log
          const webhookLog = await prisma.webhookLog.upsert({
            where: {
              message_id_webhook_id: {
                message_id: message.id,
                webhook_id: webhook.id,
              },
            },
            create: {
              status: 'PENDING',
              message_id: message.id,
              method: webhook.method,
              url: webhook.url,
              webhook_id: webhook.id,
            },
            update: {
              status: 'PENDING',
              attempts: { increment: 1 },
              error: null,
            },
            select: {
              id: true,
            },
          })

          const attachments = await getAttachments({ env: this.env, message })

          const operation =
            webhook.method === 'POST' || webhook.method === 'PUT'
              ? () => {
                  return executePostOrPut({
                    webhook,
                    message,
                    attachments,
                  })
                }
              : () => {
                  return executeGetOrDelete({ webhook })
                }

          try {
            if (Math.random() < 0.4) {
              throw new Error('Test error')
            }

            await operation()

            await prisma.webhookLog.update({
              where: { id: webhookLog.id },
              data: {
                status: 'SUCCESS',
              },
            })

            await getFreshMessageAndBroadcast({
              env: this.env,
              prisma,
              message,
              project,
            })
          } catch (error) {
            await prisma.webhookLog.update({
              where: { id: webhookLog.id },
              data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            })

            await getFreshMessageAndBroadcast({
              env: this.env,
              prisma,
              message,
              project,
            })

            throw error // Re-throw to trigger workflow retry
          }
        }
      },
    }
  }

  finalizeMessageStatus({
    createdMessage,
    webhooks,
    message,
    project,
  }: {
    createdMessage: CreatedMessage
    webhooks: Webhook[]
    message: Message
    project: Project
  }) {
    return {
      description: 'Finalize message status',
      fn: () => {
        return async () => {
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
            select: MESSAGE_SELECT,
          })

          const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
          const statusObj = this.env.MESSAGE_STATUS.get(id)

          await statusObj.fetch('http://internal/broadcast', {
            method: 'POST',
            body: JSON.stringify(updatedMessage),
          })

          return updatedMessage
        }
      },
    }
  }
}
