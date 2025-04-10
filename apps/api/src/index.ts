import { zValidator } from '@hono/zod-validator'
import { createPrismaClient } from '@postilion/db/edge'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import PostalMime from 'postal-mime'
import { z } from 'zod'
export { InboundEmailWorkflow } from './inbound-workflow/inbound-workflow'
export { MessageStatus } from './message-status'

const app = new Hono<{ Bindings: Env }>()

// Test inbound route to trigger the workflow
app.post(
  '/inbound',
  zValidator(
    'json',
    z.object({
      from: z.string().email(),
      to: z.string().email(),
      subject: z.string(),
      content: z.string(),
      contentText: z.string().optional(),
      attachments: z.array(
        z.object({
          filename: z.string(),
          mimeType: z
            .string()
            .refine(
              (mime) => mime.startsWith('application/pdf') || mime.startsWith('image/'),
              'Only PDF and image files are allowed',
            ),
          content: z.string().base64(),
        }),
      ),
    }),
  ),
  async (c) => {
    const { from, to, subject, content, contentText, attachments } = c.req.valid('json')

    const newId = crypto.randomUUID()

    const instance = await c.env.INBOUND_EMAIL_WORKFLOW.create({
      id: newId,
      params: {
        from,
        to,
        subject,
        content,
        contentText,
        attachments,
      },
    })

    const instanceStatus = await instance.status()

    return c.json({
      instanceId: instance.id,
      status: instanceStatus,
    })
  },
)

// Route to get the status of the inbound email workflow
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
    } catch (_error) {
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

// Route for the SSE endpoint for the message stream
app.get(
  '/sse/:teamSlug/:projectSlug',
  cors({
    origin: ['http://localhost:3000', 'https://app.postilion.ai'],
    credentials: false,
    exposeHeaders: ['Content-Type'],
    allowHeaders: ['Content-Type', 'Accept'],
  }),
  zValidator(
    'param',
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
    }),
  ),
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
    } catch (_error) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
  },
  // Forward to the SSE endpoint in the Durable Object -> Persists the connection via streamed SSE:s
  async (c) => {
    const { teamSlug, projectSlug } = c.req.valid('param')

    const id = c.env.MESSAGE_STATUS.idFromName(`${teamSlug}-${projectSlug}`)
    const stub = c.env.MESSAGE_STATUS.get(id)

    // Forward to the SSE endpoint in the Durable Object
    return stub.fetch(new Request('http://internal/sse'))
  },
)

// Route to get presigned urls for attachments
app.get(
  '/attachments/:key',
  cors({
    origin: ['http://localhost:3000', 'https://app.postilion.ai'],
    credentials: true,
  }),
  zValidator('param', z.object({ key: z.string() })),
  async (c) => {
    const { key } = c.req.valid('param')

    const r2Object = await c.env.ATTACHMENTS.get(key)

    if (!r2Object) {
      return c.notFound()
    }

    const res = await fetch(`${c.env.APP_URL}/api/auth/get-session`, {
      headers: {
        cookie: c.req.header('cookie') ?? '',
      },
    }).catch((error) => {
      console.error(error)

      return c.notFound()
    })

    if (!res.ok) {
      return c.notFound()
    }

    let session: { session?: { id: string }; user?: { id: string } }

    try {
      session = await res.json()

      if (!session.session || !session.user) {
        return c.notFound()
      }
    } catch (_error) {
      return c.notFound()
    }

    const prisma = createPrismaClient(c.env.DATABASE_URL)

    // Check if the attachment belongs to the user
    const attachment = await prisma.attachment
      .findUnique({
        where: {
          r2_key: key,
          message: {
            project: {
              team: {
                members: {
                  some: {
                    user_id: session.user.id,
                  },
                },
              },
            },
          },
        },
      })
      .catch((error) => {
        console.error(error)

        return c.notFound()
      })

    if (!attachment) {
      return c.notFound()
    }

    return c.body(r2Object.body, {
      headers: {
        'Content-Type': r2Object.httpMetadata?.contentType ?? 'application/octet-stream',
      },
    })
  },
)

// Export the worker
export default {
  fetch: app.fetch,
  email: async (message, env) => {
    const email = await PostalMime.parse(message.raw, {
      attachmentEncoding: 'base64',
    })

    let to = email.to?.at(0)?.address

    if (!to) {
      throw new Error('No to address')
    }

    // For testing purposes
    if (to === 'christian.alares@gmail.com') {
      to = 'testgmail@inbound.seventy-seven.app'
    }

    const attachments = email.attachments
      .filter((attachment) => attachment.mimeType.startsWith('image/') || attachment.mimeType === 'application/pdf')
      .map((attachment) => {
        return {
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          // string because we're using the base64 encoding
          content: attachment.content as string,
        }
      })

    const newId = crypto.randomUUID()

    await env.INBOUND_EMAIL_WORKFLOW.create({
      id: newId,
      params: {
        from: email.from.address,
        to,
        subject: email.subject ?? '',
        content: email.html || email.text || '<empty message>',
        contentText: email.text || '<empty message>',
        attachments,
      },
    })
  },
} satisfies ExportedHandler<Env>
