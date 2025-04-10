import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

const getForProject = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const messages = await queries.messages.getMessagesForProject(ctx.prisma, {
      projectSlug: input.projectSlug,
      teamSlug: input.teamSlug,
      userId: ctx.user.id,
    })

    return messages
  })

const getById = authProcedure.input(z.object({ messageId: z.string() })).query(async ({ ctx, input }) => {
  const message = await queries.messages
    .getMessageById(ctx.prisma, {
      id: input.messageId,
      userId: ctx.user.id,
    })
    .catch(() => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not fetch message',
      })
    })

  if (!message) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Message not found',
    })
  }

  return message
})

export const messagesRouter = createTRPCRouter({
  getForProject,
  getById,
})
