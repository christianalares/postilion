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
    const messages = await ctx.prisma.message.findMany({
      where: {
        project: {
          slug: input.projectSlug,
          team: {
            slug: input.teamSlug,
            // Make sure the user is a member of the team that the project belongs to
            members: {
              some: {
                user_id: ctx.user.id,
              },
            },
          },
        },
      },
      include: {
        attachments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return messages
  })

const getById = authProcedure.input(z.object({ messageId: z.string() })).query(async ({ ctx, input }) => {
  const message = await ctx.prisma.message
    .findUnique({
      where: {
        id: input.messageId,
        project: {
          team: {
            // Make sure the user is a member of the team that the project belongs to
            members: {
              some: {
                user_id: ctx.user.id,
              },
            },
          },
        },
      },
      include: {
        attachments: true,
      },
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
