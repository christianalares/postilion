import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { t } from '../init'

const teamSlugSchema = z.object({
  teamSlug: z.string(),
})

export const isTeamMember = t.middleware(async ({ ctx, input, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  const user = ctx.user

  const { teamSlug } = teamSlugSchema.parse(input)

  const team = await ctx.prisma.team.findFirst({
    where: {
      slug: teamSlug,
    },
    select: {
      id: true,
      subscription_id: true,
      members: {
        select: {
          user_id: true,
        },
      },
    },
  })

  if (!team) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Team not found',
    })
  }

  const memberOnTeam = team.members.find((member) => member.user_id === user.id)

  if (!memberOnTeam) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this team',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user,
      team,
    },
  })
})

export const isTeamOwner = t.middleware(async ({ ctx, input, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  const user = ctx.user

  const { teamSlug } = teamSlugSchema.parse(input)

  const team = await ctx.prisma.team.findFirst({
    where: {
      slug: teamSlug,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      subscription_id: true,
      members: {
        select: {
          role: true,
          user_id: true,
        },
      },
    },
  })

  if (!team) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Team not found',
    })
  }

  const memberOnTeam = team.members.find((member) => member.user_id === user.id)

  if (memberOnTeam?.role !== 'OWNER') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not an owner of this team',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user,
      team,
    },
  })
})
