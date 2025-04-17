import type { PrismaClient } from '../client'

export const createWebhook = async (
  prisma: PrismaClient,
  input: {
    projectId: string
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    secret: string
  },
) => {
  const webhook = await prisma.webhook.create({
    data: {
      project_id: input.projectId,
      url: input.url,
      method: input.method,
      secret: input.secret,
    },
    select: {
      id: true,
      url: true,
      method: true,
      secret: true,
    },
  })

  return webhook
}

export const updateWebhook = async (
  prisma: PrismaClient,
  input: {
    id: string
    data: Partial<{
      url: string
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      secret: string
    }>
  },
) => {
  const updatedWebhook = await prisma.webhook.update({
    where: {
      id: input.id,
    },
    data: {
      url: input.data.url,
      method: input.data.method,
      secret: input.data.secret,
    },
    select: {
      id: true,
      url: true,
      method: true,
      project_id: true,
      secret: true,
    },
  })

  return updatedWebhook
}

export const deleteWekhook = async (
  prisma: PrismaClient,
  input: {
    id: string
  },
) => {
  const deletedWebhook = await prisma.webhook.delete({
    where: {
      id: input.id,
    },
    select: {
      id: true,
      url: true,
      method: true,
      project_id: true,
    },
  })

  return deletedWebhook
}
