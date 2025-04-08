import { createShortId, createSlug } from '@/lib/utils'
import { isPrismaError } from '@postilion/db'
import { ENUMS } from '@postilion/db/enums'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { hasTeamRole, isMemberOfTeam } from '../middlewares/team'

const checkTrialEnded = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const team = await ctx.prisma.team.findUnique({
      where: { slug: input.teamSlug },
      select: {
        end_free_trial: true,
        subscription_id: true,
        slug: true,
      },
    })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const needs_subscription =
      !!team.end_free_trial && new Date(team.end_free_trial) < new Date() && !team.subscription_id

    return {
      needs_subscription,
      slug: team.slug,
    }
  })

const getBySlug = authProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .use(isMemberOfTeam)
  .query(async ({ ctx }) => {
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

    ctx.analyticsClient.track('team_updated', {
      team_id: updatedTeam.id,
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

    ctx.analyticsClient.track('team_created', {
      team_id: createdTeam.id,
      team_name: createdTeam.name,
    })

    return createdTeam
  })

const leave = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        include: {
          members: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to leave team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    // We have already checked that the user is on the team, so we can safely check if they are the last member
    const isLastMember = team.members.length === 1

    if (isLastMember) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You are the only member of this team. Please delete the team instead.',
      })
    }

    const leftTeam = await ctx.prisma.userOnTeam.delete({
      where: {
        user_id_team_id: {
          user_id: ctx.user.id,
          team_id: team.id,
        },
      },
    })

    return leftTeam
  })

const editRole = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      userId: z.string(),
      role: z.nativeEnum(ENUMS.TEAM_ROLE_ENUM),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: { slug: input.teamSlug },
        include: {
          members: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to edit role',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (userOnTeam.role !== 'OWNER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an owner of this team',
      })
    }

    const updatedUserOnTeam = await ctx.prisma.userOnTeam.update({
      where: {
        user_id_team_id: {
          user_id: input.userId,
          team_id: team.id,
        },
      },
      data: {
        role: input.role,
      },
      include: {
        user: true,
      },
    })

    return updatedUserOnTeam
  })

export const teamsRouter = createTRPCRouter({
  update,
  getBySlug,
  getForUser,
  create,
  leave,
  editRole,
  checkTrialEnded,
})
