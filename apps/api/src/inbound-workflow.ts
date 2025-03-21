import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { createPrismaClient } from '@postilion/db/edge'
import { generateObject } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

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
        const [shortId] = toEmail.split('@')[0]

        const prohectFromShortId = await step.do('Get project by short id', async () => {
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

        return prohectFromShortId
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

      const prisma = createPrismaClient(this.env.DATABASE_URL)

      await prisma.attachment
        .createManyAndReturn({
          data: event.payload.attachments.map((attachment) => ({
            message_id: createdMessage.id,
            filename: attachment.filename,
            mime_type: attachment.mimeType,
            content: attachment.content,
          })),
        })
        .catch((error) => {
          console.error(error)
          throw new Error('Error creating attachments')
        })

      const latestMessage = await prisma.message.findUnique({
        where: {
          id: createdMessage.id,
        },
        include: {
          attachments: true,
        },
      })

      if (!latestMessage) {
        throw new Error(`Message with id ${createdMessage.id} not found`)
      }

      try {
        const id = this.env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
        const statusObj = this.env.MESSAGE_STATUS.get(id)

        await statusObj.fetch('http://internal/broadcast', {
          method: 'POST',
          body: JSON.stringify(latestMessage),
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

      await prisma.message.update({
        where: {
          id: createdMessage.id,
        },
        data: {
          body_ai_summary: object.summary,
        },
      })

      return object.summary
    })

    await step.do('Finalize the message in the database', async () => {
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const updatedMessage = await prisma.message.update({
        where: {
          id: createdMessage.id,
        },
        data: {
          status: 'COMPLETED',
        },
        include: {
          attachments: true,
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

      return updatedMessage
    })
  }
}
