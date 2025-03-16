import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { createPrismaClient } from '@postilion/db/edge'
import { generateObject } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

// User-defined params passed to your workflow
type Params = {
  from: string
  shortId: string
  subject: string
  content: string
}

export class InboundEmailWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const createdMessage = await step.do('Create a new message in the database', async () => {
      const prisma = createPrismaClient(this.env.DATABASE_URL)

      const project = await prisma.project.findUnique({
        where: {
          short_id: event.payload.shortId,
        },
        include: {
          team: {
            select: {
              slug: true,
            },
          },
        },
      })

      if (!project) {
        throw new NonRetryableError('Project not found')
      }

      const createdMessage = await prisma.message.create({
        data: {
          project_id: project.id,
          slug: Math.random().toString(36).substring(2, 15),
          from: event.payload.from.trim(),
          body_raw: event.payload.content.trim(),
          subject: event.payload.subject.trim(),
          status: 'PROCESSING',
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
          project: {
            select: {
              slug: true,
              team: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      })

      const id = this.env.MESSAGE_STATUS.idFromName(
        `${updatedMessage.project.team.slug}-${updatedMessage.project.slug}`,
      )
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

    // await step.sleep('sleep', '5 seconds')

    // const my_value2 = await step.do('My Second Step', async () => {
    //   return 'b'.repeat(100)
    // })

    // await step.sleep('sleep', '1 minute')

    // await step.do(
    //   'My Second Step',
    //   {
    //     // Retries are enabled by default using the config below on all steps
    //     retries: {
    //       limit: 5,
    //       delay: '1 second',
    //       backoff: 'constant',
    //     },
    //     timeout: '15 minutes',
    //   },
    //   async () => {
    //     // Do stuff here, with access to my_value!
    //     if (Math.random() > 0.5) {
    //       throw new Error('Oh no!')
    //     }
    //   },
    // )
  }
}
