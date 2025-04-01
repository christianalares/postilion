import { createShortId } from '@/lib/utils'
import { TEAM_ROLE_ENUM } from '@postilion/db'
import { TRPCError } from '@trpc/server'
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

    const createdInvite = await ctx.prisma.teamInvite.create({
      data: {
        code: createShortId(),
        email: input.email,
        role: input.role,
        created_by_user_id: ctx.user.id,
        team_id: team.id,
      },
    })

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

    const invites = await ctx.prisma.teamInvite.findMany({
      where: {
        team_id: team.id,
      },
      include: {
        created_by: true,
      },
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
