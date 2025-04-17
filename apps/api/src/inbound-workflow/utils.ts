import crypto from 'node:crypto'
import { MESSAGE_SELECT } from '@postilion/db/constants'
import type { createPrismaClient } from '@postilion/db/edge'
import type { ReturnOfMethod } from './steps/step-factory'

export const executePostOrPut = async ({
  message,
  attachments,
  webhook,
}: {
  message: ReturnOfMethod<'getAssociatedWebhooks'>['message']
  attachments: Awaited<ReturnType<typeof getAttachments>>
  webhook: ReturnOfMethod<'getAssociatedWebhooks'>['webhooks'][number]
}) => {
  const payload = {
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
  }

  const stringifiedPayload = JSON.stringify(payload)

  const signature = crypto.createHmac('sha256', webhook.secret).update(stringifiedPayload).digest('hex')

  const response = await fetch(webhook.url, {
    method: webhook.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Postilion-Signature': signature,
    },
    body: stringifiedPayload,
  }).catch((error) => {
    throw new Error(`Webhook request failed: ${error.message}`)
  })

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`)
  }
}

export const executeGetOrDelete = async ({
  // prisma,
  // message,
  webhook,
}: {
  // prisma: ReturnType<typeof createPrismaClient>
  // message: ReturnOfMethod<'getAssociatedWebhooks'>['message']
  webhook: ReturnOfMethod<'getAssociatedWebhooks'>['webhooks'][number]
}) => {
  const signature = crypto.createHmac('sha256', webhook.secret).update(webhook.url).digest('hex')

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

  // await prisma.webhookLog.create({
  //   data: {
  //     status: 'SUCCESS',
  //     message_id: message.id,
  //     url: webhook.url,
  //     method: webhook.method,
  //   },
  // })
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
