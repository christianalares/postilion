import crypto from 'node:crypto'
import { MESSAGE_SELECT } from '@postilion/db/constants'
import type { createPrismaClient } from '@postilion/db/edge'
import type { ReturnOfMethod } from './steps/step-factory'

const generateWebhookId = () => {
  return `msg_${crypto.randomBytes(16).toString('base64url')}`
}

const preparePayload = ({
  data,
  secret,
}: {
  data?: Record<string, unknown>
  secret: string
}) => {
  const stringifiedPayload = data
    ? JSON.stringify({
        type: 'webhook.created',
        timestamp: new Date().toISOString(),
        data,
      })
    : '{}'

  const webhookId = generateWebhookId()
  const webhookTimestamp = Math.floor(Date.now() / 1000).toString()

  const base64Secret = Buffer.from(secret, 'utf-8').toString('base64')

  const contentToSign = `${webhookId}.${webhookTimestamp}.${stringifiedPayload}`

  const signature = crypto
    .createHmac('sha256', Buffer.from(base64Secret, 'base64'))
    .update(contentToSign)
    .digest('base64')

  const signatureHeader = `v1,${signature}`

  const headers = {
    'webhook-id': webhookId,
    'webhook-timestamp': webhookTimestamp,
    'webhook-signature': signatureHeader,
  }

  return {
    payload: stringifiedPayload,
    headers,
  }
}

export const executePostOrPut = async ({
  message,
  attachments,
  webhook,
}: {
  message: ReturnOfMethod<'getAssociatedWebhooks'>['message']
  attachments: Awaited<ReturnType<typeof getAttachments>>
  webhook: ReturnOfMethod<'getAssociatedWebhooks'>['webhooks'][number]
}) => {
  const { payload, headers } = preparePayload({
    data: {
      handle: message.handle,
      from: message.from,
      subject: message.subject,
      body: {
        raw: message.body_raw,
        stripped: message.body_stripped,
        summary: message.body_ai_summary,
      },
      attachments: attachments.map((attachment) => ({
        filename: attachment.filename,
        mimeType: attachment.mimeType,
        base64: attachment.base64,
      })),
    },
    secret: webhook.secret,
  })

  const response = await fetch(webhook.url, {
    method: webhook.method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: payload,
  }).catch((error) => {
    throw new Error(`Webhook request failed: ${error.message}`)
  })

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`)
  }
}

export const executeGetOrDelete = async ({
  webhook,
}: {
  webhook: ReturnOfMethod<'getAssociatedWebhooks'>['webhooks'][number]
}) => {
  const { headers } = preparePayload({
    secret: webhook.secret,
  })
  const response = await fetch(webhook.url, {
    method: webhook.method,
    headers,
  }).catch((error) => {
    throw new Error(`Webhook request failed: ${error.message}`)
  })

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`)
  }
}

export const getAttachments = async ({
  env,
  message,
}: {
  env: Env
  message: ReturnOfMethod<'getAssociatedWebhooks'>['message']
}) => {
  const attachments = (
    await Promise.all(
      message.attachments.map(async (attachment) => {
        const r2Object = await env.ATTACHMENTS.get(attachment.r2_key)

        if (!r2Object) {
          return
        }

        const buffer = await r2Object.arrayBuffer()

        return {
          filename: attachment.filename,
          mimeType: attachment.mime_type,
          base64: buffer,
        }
      }),
    )
  ).filter((attachment) => attachment !== undefined)

  return attachments
}

export const getFreshMessageAndBroadcast = async ({
  env,
  prisma,
  message,
  project,
}: {
  env: Env
  prisma: ReturnType<typeof createPrismaClient>
  message: ReturnOfMethod<'getAssociatedWebhooks'>['message']
  project: ReturnOfMethod<'getProject'>
}) => {
  const latestMessage = await prisma.message.findUnique({
    where: { id: message.id },
    select: MESSAGE_SELECT,
  })

  if (!latestMessage) {
    throw new Error('Message not found')
  }

  const id = env.MESSAGE_STATUS.idFromName(`${project.team.slug}-${project.slug}`)
  const statusObj = env.MESSAGE_STATUS.get(id)

  await statusObj.fetch('http://internal/broadcast', {
    method: 'POST',
    body: JSON.stringify(latestMessage),
  })
}
