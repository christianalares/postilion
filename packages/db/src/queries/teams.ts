import type { PrismaClient } from '../client'

export const checkTrialEnded = async (
  prisma: PrismaClient,
  input: {
    teamSlug: string
  },
) => {
  const team = await prisma.team.findUnique({
    where: { slug: input.teamSlug },
    select: {
      end_free_trial: true,
      subscription_id: true,
      slug: true,
    },
  })

  if (!team) {
    return null
  }

  const needs_subscription =
    !!team?.end_free_trial && new Date(team.end_free_trial) < new Date() && !team.subscription_id

  return {
    needs_subscription,
    slug: team.slug,
  }
}

export const getBySlug = async (
  prisma: PrismaClient,
  input: {
    slug: string
  },
) => {
  const team = await prisma.team.findUnique({
    where: {
      slug: input.slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      subscription_id: true,
      end_free_trial: true,
      members: {
        select: {
          user_id: true,
          role: true,
          user: {
            select: {
              name: true,
              image: true,
              email: true,
            },
          },
        },
      },
    },
  })

  return team
}

export const getByUserId = async (
  prisma: PrismaClient,
  input: {
    userId: string
  },
) => {
  const teamsForUser = await prisma.team.findMany({
    where: {
      members: {
        some: {
          user_id: input.userId,
        },
      },
    },
    orderBy: {
      created_at: 'asc',
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  return teamsForUser
}
