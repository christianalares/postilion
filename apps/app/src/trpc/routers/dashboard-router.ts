import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isTeamMember } from '../middlewares/team'

const getStats = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
      by: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx, input }) => {
    const stats = await queries.dashboard.getStats(ctx.prisma, {
      teamId: ctx.team.id,
      projectSlug: input.projectSlug,
      by: input.by,
    })

    return stats
  })

const getInfo = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx, input }) => {
    const project = await queries.dashboard
      .getInfo(ctx.prisma, {
        teamId: ctx.team.id,
        projectSlug: input.projectSlug,
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'PROJECT_NOT_FOUND') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Project not found',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch project info',
        })
      })

    return project
  })

export const dashboardRouter = createTRPCRouter({
  getStats,
  getInfo,
})
