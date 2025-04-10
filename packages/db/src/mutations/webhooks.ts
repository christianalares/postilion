import type { PrismaClient } from '../client'

export const createWebhook = async (
  prisma: PrismaClient,
  input: {
    projectId: string
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    signingKey: string
  },
) => {
  const webhook = await prisma.webhook.create({
    data: {
      project_id: input.projectId,
      url: input.url,
      method: input.method,
      signing_key: input.signingKey,
    },
    select: {
      id: true,
      url: true,
      method: true,
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
    },
    select: {
      id: true,
      url: true,
      method: true,
      project_id: true,
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
