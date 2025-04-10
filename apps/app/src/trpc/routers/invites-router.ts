import { createShortId } from '@/lib/utils'
import { TEAM_ROLE_ENUM } from '@postilion/db'
import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { after } from 'next/server'
import { z } from 'zod'
import { authProcedure, baseProcedure, createTRPCRouter } from '../init'

const create = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      email: z.string().email(),
      role: z.nativeEnum(TEAM_ROLE_ENUM),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          invites: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team not found',
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

    const existingInvite = team.invites.some((invite) => invite.email === input.email)

    if (existingInvite) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'INVITE_ALREADY_EXISTS',
      })
    }

    const existingMember = team.members.some((member) => member.user.email === input.email)

    if (existingMember) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'MEMBER_ALREADY_EXISTS',
      })
    }

    const createdInvite = await mutations.invites
      .createInvite(ctx.prisma, {
        code: createShortId(),
        email: input.email,
        role: input.role,
        teamId: team.id,
        createdByUserId: ctx.user.id,
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create invite',
        })
      })

    ctx.analyticsClient.track('invite_created', {
      invite_id: createdInvite.id,
      invite_email: createdInvite.email,
      invite_role: createdInvite.role,
      team_id: team.id,
      team_name: team.name,
    })

    after(
      ctx.emailClient.send({
        type: 'invite-user',
        to: input.email,
        props: {
          code: createdInvite.code,
          email: input.email,
          team: {
            name: team.name,
          },
          invitedBy: {
            name: ctx.user.name,
            avatar: ctx.user.image,
            email: ctx.user.email,
          },
        },
      }),
    )

    return createdInvite
  })

const getForTeam = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
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
          code: 'NOT_FOUND',
          message: 'Team not found',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const invites = await queries.invites
      .getByTeamId(ctx.prisma, {
        teamId: team.id,
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get invites',
        })
      })

    return invites
  })

const cancel = authProcedure
  .input(
    z.object({
      inviteId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const invite = await ctx.prisma.teamInvite
      .findUnique({
        where: {
          id: input.inviteId,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get invite',
        })
      })

    if (!invite) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invite not found',
      })
    }

    const userOnTeam = invite.team.members.find((member) => member.user_id === ctx.user.id)

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

    const deletedInvite = await ctx.prisma.teamInvite.delete({
      where: { id: input.inviteId },
    })

    ctx.analyticsClient.track('invite_deleted', {
      invite_id: deletedInvite.id,
      invite_email: deletedInvite.email,
      invite_role: deletedInvite.role,
      team_id: deletedInvite.team_id,
    })

    return deletedInvite
  })

const get = baseProcedure
  .input(
    z.object({
      code: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const invite = await ctx.prisma.teamInvite
      .findUnique({
        where: {
          code: input.code,
        },
        select: {
          code: true,
          email: true,
          team: {
            select: {
              name: true,
              slug: true,
            },
          },
          created_by: {
            select: {
              name: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get invite',
        })
      })

    if (!invite) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invite not found',
      })
    }

    return invite
  })

export const invitesRouter = createTRPCRouter({
  create,
  cancel,
  getForTeam,
  get,
})
