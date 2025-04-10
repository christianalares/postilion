import type { PrismaClient } from '../client'

export const updateProject = async (
  prisma: PrismaClient,
  input: {
    teamId: string
    projectSlug: string
    data: Partial<{
      name: string
      domainId: string
    }>
  },
) => {
  const updatedProject = await prisma.project.update({
    where: {
      team_id_slug: {
        team_id: input.teamId,
        slug: input.projectSlug,
      },
    },
    data: {
      name: input.data.name,
      domain: input.data.domainId ? { connect: { id: input.data.domainId } } : undefined,
    },
    select: {
      id: true,
      name: true,
      domain: {
        select: {
          id: true,
          domain: true,
        },
      },
    },
  })

  return updatedProject
}

export const createProject = async (
  prisma: PrismaClient,
  input: {
    name: string
    slug: string
    shortId: string
    createdByUserId: string
    teamId: string
  },
) => {
  const createdProject = await prisma.project.create({
    data: {
      name: input.name,
      slug: input.slug,
      short_id: input.shortId,
      created_by_user_id: input.createdByUserId,
      team_id: input.teamId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  return createdProject
}
