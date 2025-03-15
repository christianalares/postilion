import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers'
import { NonRetryableError } from 'cloudflare:workflows'
import { createPrismaClient } from '@postilion/db/edge'
import { generateObject } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

// User-defined params passed to your workflow
type Params = {
  from: string
  id: string
  subject: string
  content: string
}

export class InboundEmailWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const workersai = createWorkersAI({ binding: this.env.AI })

    const prisma = createPrismaClient(this.env.DATABASE_URL)

    const createdMessage = await step.do('Create a new message in the database', async () => {
      const project = await prisma.project.findUnique({
        where: {
          id: event.payload.id,
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

      return createdMessage
    })

    await step.sleep('sleep', '10 seconds')

    const strippedBody = await step.do('Get a stripped body of the email', async () => {
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

      //     const result = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      //       response_format: {
      //         type: 'json_schema',
      //         json_schema: {
      //           schema: schema.shape,
      //         },
      //       },
      //       messages: [
      //         {
      //           role: 'system',
      //           content: `You are a helpful assistant that analyzes email HTML and returns a stripped clean text version of the email body.
      // * Analyze this and give me a version where all the HTML is removed.
      // * Remove any irrelevant information such as copyrights, footers, unsubscribe links/texts etc.
      // * Send the response as a string without any format (no markup, no markdown etc, only pure text).
      // * ONLY respond with the parsed text without any prefixes about "Here is your desired results" or similar.`,
      //         },
      //         {
      //           role: 'user',
      //           content: event.payload.content,
      //         },
      //       ],
      //     })

      //     console.log('here')
    })

    await step.sleep('sleep', '10 seconds')

    await step.do('Generate a summary of the stripped email body', async () => {
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

    await step.sleep('sleep', '10 seconds')

    await step.do('Finalize the message in the database', async () => {
      const updatedMessage = await prisma.message.update({
        where: {
          id: createdMessage.id,
        },
        data: {
          status: 'COMPLETED',
        },
      })

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
