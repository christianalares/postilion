import { createShortId, createSlug } from '@/lib/utils'
import { isPrismaError } from '@postilion/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { hasTeamRole, isMemberOfTeam } from '../middlewares/team'

const getBySlug = authProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .use(isMemberOfTeam)
  .query(async ({ ctx, input }) => {
    return ctx.team
    // try {
    // 	const team = await ctx.prisma.team.findUnique({
    // 		where: { slug: input.slug },
    // 	})

    // 	if (!team) {
    // 		throw new TRPCError({
    // 			code: 'NOT_FOUND',
    // 			message: 'Team not found',
    // 		})
    // 	}

    // 	return team
    // } catch (error) {
    // 	throw new TRPCError({
    // 		code: 'INTERNAL_SERVER_ERROR',
    // 		message: 'Failed to get team',
    // 	})
    // }
  })

const update = authProcedure
  .input(
    z.object({
      slug: z.string(),
      data: z
        .object({
          name: z.string(),
        })
        .partial(),
    }),
  )
  .use(hasTeamRole('OWNER'))
  .mutation(async ({ ctx, input }) => {
    const updatedTeam = await ctx.prisma.team
      .update({
        where: {
          slug: input.slug,
        },
        data: {
          name: input.data.name,
        },
      })
      .catch((error) => {
        if (isPrismaError(error) && error.code === 'P2002') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Team slug is already taken',
          })
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update team',
        })
      })

    return updatedTeam
  })

const getForUser = authProcedure.query(async ({ ctx }) => {
  const teamsForUser = await ctx.prisma.team
    .findMany({
      where: {
        members: {
          some: {
            user_id: ctx.user.id,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    })
    .catch(() => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get teams for user',
      })
    })

  return teamsForUser
})

const create = authProcedure
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const createdTeam = await ctx.prisma.team
      .create({
        data: {
          name: input.name,
          slug: `${createSlug(input.name)}-${createShortId()}`,
          members: {
            create: {
              user_id: ctx.user.id,
              role: 'OWNER',
            },
          },
          projects: {
            create: {
              name: 'Default',
              slug: 'default',
              created_by_user_id: ctx.user.id,
              short_id: createShortId(),
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create team',
        })
      })

    return createdTeam
  })

export const teamsRouter = createTRPCRouter({
  update,
  getBySlug,
  getForUser,
  create,
})
