import type { PrismaClient } from '../client'

export const getForProject = async (
  prisma: PrismaClient,
  input: {
    projectId: string
  },
) => {
  const webhooks = await prisma.webhook.findMany({
    where: {
      project_id: input.projectId,
    },
    select: {
      id: true,
      method: true,
      url: true,
      secret: true,
    },
    orderBy: {
      created_at: 'asc',
    },
  })

  return webhooks
}
