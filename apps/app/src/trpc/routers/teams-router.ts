import { createShortId, createSlug } from '@/lib/utils'
import { ENUMS } from '@postilion/db/enums'
import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
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
      slug: z.string(),
    }),
  )
  .use(isMemberOfTeam)
  .query(async ({ input, ctx }) => {
    const team = await queries.teams
      .getBySlug(ctx.prisma, {
        slug: input.slug,
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
    const updatedTeam = await mutations.teams
      .updateTeam(ctx.prisma, {
        teamSlug: input.slug,
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

    const leftTeam = await mutations.teams.leaveTeam(ctx.prisma, {
      userId: ctx.user.id,
      teamId: team.id,
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

    const updatedUserOnTeam = await mutations.teams.editRole(ctx.prisma, {
      teamId: team.id,
      userId: input.userId,
      role: input.role,
    })

    ctx.analyticsClient.track('team_member_role_updated', {
      team_id: team.id,
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
