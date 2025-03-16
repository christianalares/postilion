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
      orderBy: {
        created_at: 'desc',
      },
    })

    return messages
  })

export const messagesRouter = createTRPCRouter({
  getForProject,
})
