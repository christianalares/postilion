import type { PrismaClient } from '../client'

export const getProjectsForTeam = async (
  prisma: PrismaClient,
  input: {
    teamSlug: string
    userId: string
  },
) => {
  const projectsForTeam = await prisma.project.findMany({
    where: {
      team: {
        slug: input.teamSlug,
      },
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
    teamSlug: string
    projectSlug: string
    userId: string
  },
) => {
  const project = await prisma.project.findFirst({
    where: {
      team: {
        slug: input.teamSlug,
        // Make sure the user is a member of the team that the project belongs to
        members: {
          some: {
            user_id: input.userId,
          },
        },
      },
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
