import type { PrismaClient } from '../client'

export const getProjectsForTeam = async (
  prisma: PrismaClient,
  input: {
    teamId: string
  },
) => {
  const projectsForTeam = await prisma.project.findMany({
    where: {
      team_id: input.teamId,
    },
    select: {
      id: true,
      created_at: true,
      slug: true,
      name: true,
      team: {
        select: {
          members: {
            select: {
              user_id: true,
            },
          },
        },
      },
    },
  })

  return projectsForTeam
}

export const getProjectBySlug = async (
  prisma: PrismaClient,
  input: {
    teamId: string
    projectSlug: string
  },
) => {
  const project = await prisma.project.findFirst({
    where: {
      team_id: input.teamId,
      slug: input.projectSlug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      domain: {
        select: {
          id: true,
        },
      },
      team: {
        select: {
          members: {
            select: {
              user_id: true,
              role: true,
            },
          },
        },
      },
    },
  })

  return project
}
