import type { ENUMS } from '@postilion/db/enums'
import type { PrismaClient } from '../client'

export const updateTeam = async (
  prisma: PrismaClient,
  input: {
    teamSlug: string
    data: Partial<{
      name: string
    }>
  },
) => {
  const updatedTeam = await prisma.team.update({
    where: {
      slug: input.teamSlug,
    },
    data: {
      name: input.data.name,
    },
    select: {
      id: true,
    },
  })

  return updatedTeam
}

export const createTeam = async (
  prisma: PrismaClient,
  input: {
    userId: string
    name: string
    slug: string
    projectShortId: string
  },
) => {
  const createdTeam = await prisma.team.create({
    data: {
      name: input.name,
      slug: input.slug,
      members: {
        create: {
          user_id: input.userId,
          role: 'OWNER',
        },
      },
      projects: {
        create: {
          name: 'Default',
          slug: 'default',
          created_by_user_id: input.userId,
          short_id: input.projectShortId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  return createdTeam
}

export const leaveTeam = async (
  prisma: PrismaClient,
  input: {
    userId: string
    teamId: string
  },
) => {
  const leftTeam = await prisma.userOnTeam.delete({
    where: {
      user_id_team_id: {
        user_id: input.userId,
        team_id: input.teamId,
      },
    },
    select: {
      user_id: true,
      team_id: true,
    },
  })

  return leftTeam
}

export const editRole = async (
  prisma: PrismaClient,
  input: {
    userId: string
    teamId: string
    role: keyof typeof ENUMS.TEAM_ROLE_ENUM
  },
) => {
  const updatedRole = await prisma.userOnTeam.update({
    where: {
      user_id_team_id: {
        user_id: input.userId,
        team_id: input.teamId,
      },
    },
    data: {
      role: input.role,
    },
    select: {
      role: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  return updatedRole
}
