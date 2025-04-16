import type { PrismaClient } from '../client'
import { MESSAGE_SELECT } from '../constants'

export const getMessagesForProject = async (
  prisma: PrismaClient,
  input: {
    teamId: string
    projectSlug: string
  },
) => {
  const messages = await prisma.message.findMany({
    where: {
      project: {
        slug: input.projectSlug,
        team_id: input.teamId,
      },
    },
    select: MESSAGE_SELECT,
    orderBy: {
      created_at: 'desc',
    },
  })

  return messages
}

export const getMessageById = async (
  prisma: PrismaClient,
  input: {
    id: string
  },
) => {
  const message = await prisma.message.findUnique({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      from: true,
      subject: true,
      created_at: true,
      body_ai_summary: true,
      body_stripped: true,
      body_text: true,
      body_raw: true,
      webhook_logs: {
        select: {
          id: true,
          status: true,
          url: true,
          attempts: true,
          error: true,
        },
      },
      attachments: {
        select: {
          id: true,
          mime_type: true,
          r2_key: true,
          filename: true,
        },
      },
    },
  })

  return message
}
