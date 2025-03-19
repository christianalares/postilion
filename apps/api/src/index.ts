import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { cors } from 'hono/cors'
import PostalMime from 'postal-mime'
import { z } from 'zod'
export { InboundEmailWorkflow } from './inbound-workflow'
export { MessageStatus } from './message-status'

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://app.postilion.ai'],
    credentials: false,
    exposeHeaders: ['Content-Type'],
    allowHeaders: ['Content-Type', 'Accept'],
  }),
)

app.post(
  '/inbound',
  zValidator(
    'json',
    z.object({
      from: z.string(),
      shortId: z.string(),
      subject: z.string(),
      content: z.string(),
    }),
  ),
  async (c) => {
    const { from, shortId, subject, content } = c.req.valid('json')

    const newId = crypto.randomUUID()

    const instance = await c.env.INBOUND_EMAIL_WORKFLOW.create({
      id: newId,
      params: {
        from,
        shortId,
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

app.get(
  '/sse/:teamSlug/:projectSlug',
  zValidator('param', z.object({ teamSlug: z.string(), projectSlug: z.string() })),
  // Go back to the app to get the session since this request comes from the apps client
  async (c, next) => {
    try {
      const res = await fetch(`${c.env.APP_URL}/api/auth/get-session`, {
        headers: {
          cookie: c.req.header('cookie') ?? '',
        },
      })

      if (!res.ok) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const session = (await res.json()) as { session: { id: string } } | null

      if (!session) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      await next()
    } catch (error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
  },
  async (c) => {
    const { teamSlug, projectSlug } = c.req.valid('param')

    const id = c.env.MESSAGE_STATUS.idFromName(`${teamSlug}-${projectSlug}`)
    const stub = c.env.MESSAGE_STATUS.get(id)

    // Forward to the SSE endpoint in the Durable Object
    return stub.fetch(new Request('http://internal/sse'))
  },
)

// Define the worker with proper types
export default {
  fetch: app.fetch,
  email: async (message, env, ctx) => {
    const email = await PostalMime.parse(message.raw, {
      attachmentEncoding: 'base64',
    })

    const to = email.to?.at(0)?.address

    console.log('to', to)

    if (!to) {
      throw new Error('No to address')
    }

    const [shortId] = to.split('@')

    const newId = crypto.randomUUID()

    const instance = await env.INBOUND_EMAIL_WORKFLOW.create({
      id: newId,
      params: {
        from: email.from.address,
        shortId,
        subject: email.subject ?? '',
        content: email.html || email.text || '<empty message>',
      },
    })

    // const instanceStatus = await instance.status()

    // return new Response(
    //   JSON.stringify({
    //     instanceId: instance.id,
    //     status: instanceStatus,
    //   }),
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   },
    // )

    // // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // console.log('Email', email)

    // ctx.waitUntil(message.forward('christian@hiddenvillage.se'))
  },
} satisfies ExportedHandler<Env>
