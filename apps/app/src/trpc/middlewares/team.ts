import type { TEAM_ROLE_ENUM } from '@postilion/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { t } from '../init'

const teamSlugSchema = z.object({
  slug: z.string(),
})

export const isMemberOfTeam = t.middleware(async ({ ctx, input, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  const parsedInput = teamSlugSchema.safeParse(input)

  if (!parsedInput.success) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid team id',
    })
  }

  const team = await ctx.prisma.team.findFirst({
    where: {
      slug: parsedInput.data.slug,
    },
    include: {
      members: {
        include: {
          user: true,
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

  if (!team.members.some((member) => member.user_id === ctx.user?.id)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this team',
    })
  }

  return next({
    ctx: {
      ...ctx,
      team,
    },
  })
})

export const hasTeamRole = (role: TEAM_ROLE_ENUM) =>
  t.middleware(async ({ ctx, input, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      })
    }

    const parsedInput = teamSlugSchema.safeParse(input)

    if (!parsedInput.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid team id',
      })
    }

    const team = await ctx.prisma.team
      .findFirst({
        where: {
          slug: parsedInput.data.slug,
        },
        include: {
          members: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check if user role',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const memberInTeam = team.members.find((member) => member.user_id === ctx.user?.id)

    if (!memberInTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (memberInTeam.role !== role) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to do that',
      })
    }

    return next()
  })
