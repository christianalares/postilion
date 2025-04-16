import { createShortId, createSlug } from '@/lib/utils'
import { ENUMS } from '@postilion/db/enums'
import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isTeamMember, isTeamOwner } from '../middlewares/team'

const checkTrialEnded = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx, input }) => {
    const team = await queries.teams.checkTrialEnded(ctx.prisma, {
      teamSlug: input.teamSlug,
    })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    return team
  })

const getBySlug = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ input, ctx }) => {
    const team = await queries.teams
      .getBySlug(ctx.prisma, {
        slug: input.teamSlug,
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    return team
  })

const update = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      data: z
        .object({
          name: z.string(),
        })
        .partial(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const updatedTeam = await mutations.teams
      .updateTeam(ctx.prisma, {
        teamSlug: input.teamSlug,
        data: {
          name: input.data.name,
        },
      })
      .catch(() => {
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
  const teamsForUser = await queries.teams
    .getByUserId(ctx.prisma, {
      userId: ctx.user.id,
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
    const createdTeam = await mutations.teams
      .createTeam(ctx.prisma, {
        userId: ctx.user.id,
        name: input.name,
        slug: `${createSlug(input.name)}-${createShortId()}`,
        projectShortId: createShortId(),
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
  .use(isTeamMember)
  .mutation(async ({ ctx }) => {
    // We have already checked that the user is on the team in the middleware
    // so we can safely check if it is only one member left, because if it is,
    // the user is that member
    const isLastMember = ctx.team.members.length === 1

    if (isLastMember) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You are the only member of this team. Please delete the team instead.',
      })
    }

    const leftTeam = await mutations.teams.leaveTeam(ctx.prisma, {
      userId: ctx.user.id,
      teamId: ctx.team.id,
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
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const updatedUserOnTeam = await mutations.teams.editRole(ctx.prisma, {
      teamId: ctx.team.id,
      userId: input.userId,
      role: input.role,
    })

    ctx.analyticsClient.track('team_member_role_updated', {
      team_id: ctx.team.id,
      user_id: input.userId,
      role: input.role,
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
