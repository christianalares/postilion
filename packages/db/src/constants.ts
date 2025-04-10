import type { Prisma } from '../generated/client'

export const MESSAGE_SELECT: Prisma.MessageSelect = {
  id: true,
  from: true,
  subject: true,
  created_at: true,
  handle: true,
  status: true,
  body_ai_summary: true,
  attachments: {
    select: {
      id: true,
    },
  },
  webhook_logs: {
    select: {
      id: true,
      status: true,
    },
  },
}
