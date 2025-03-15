import { zValidator } from '@hono/zod-validator'
// import { createPrismaClient } from '@postilion/db/edge'
import { Hono } from 'hono'
import PostalMime from 'postal-mime'
import { z } from 'zod'

export { InboundEmailWorkflow } from './inbound-workflow'

const app = new Hono<{ Bindings: Env }>()

app.post(
  '/inbound',
  zValidator(
    'json',
    z.object({
      from: z.string(),
      id: z.string(),
      subject: z.string(),
      content: z.string(),
    }),
  ),
  async (c) => {
    // const prisma = createPrismaClient(c.env.DATABASE_URL)

    // const updatedUser = await prisma.user.update({
    //   where: {
    //     email: 'christian.alares@gmail.com',
    //   },
    //   data: {
    //     name: 'Christian Alares New',
    //   },
    // })

    // return c.json({
    //   updatedUser,
    // })

    const { from, id, subject, content } = c.req.valid('json')

    const newId = crypto.randomUUID()

    const instance = await c.env.INBOUND_EMAIL_WORKFLOW.create({
      id: newId,
      params: {
        from,
        id,
        subject,
        content,
      },
    })

    const instanceStatus = await instance.status()

    return c.json({
      instanceId: instance.id,
      status: instanceStatus,
    })
  },
)

app.get(
  '/inbound/:instanceId',
  zValidator(
    'param',
    z.object({
      instanceId: z.string(),
    }),
  ),
  async (c) => {
    const { instanceId } = c.req.valid('param')

    try {
      const instance = await c.env.INBOUND_EMAIL_WORKFLOW.get(instanceId)

      const status = await instance.status()

      return c.json({
        status,
      })
    } catch (error) {
      return c.json(
        {
          instanceId,
          error: 'Instance not found',
        },
        404,
      )
    }
  },
)

// Define the worker with proper types
export default {
  fetch: app.fetch,
  email: async (message, env, ctx) => {
    // env.EMAIL_QUEUE_BINDING.send({
    //   hello: 'world',
    // })

    const email = await PostalMime.parse(message.raw, {
      attachmentEncoding: 'base64',
    })

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('Email', email)

    ctx.waitUntil(message.forward('christian@hiddenvillage.se'))
  },
  // queue: (message, env, ctx) => {
  //   console.log('Received queue message', message)
  // },
} satisfies ExportedHandler<Env>

// // Define the environment variables interface
// interface Env {
//   // Add any environment variables you're using
//   // For example:
//   // MY_SECRET: string;
//   // EMAIL_QUEUE_BINDING: Queue<{ hello: string }>
// }
