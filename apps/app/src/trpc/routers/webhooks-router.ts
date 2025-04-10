import crypto from 'node:crypto'
import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

export const generateSigningKey = () => {
  return crypto.randomBytes(32).toString('hex')
}

const create = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
      url: z.string().url(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const project = await ctx.prisma.project
      .findFirst({
        where: {
          team: { slug: input.teamSlug },
          slug: input.projectSlug,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get project',
        })
      })

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      })
    }

    const userInTeam = project.team.members.find((member) => member.user_id === ctx.user.id)

    if (!userInTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    const createdWebhook = await mutations.webhooks.createWebhook(ctx.prisma, {
      projectId: project.id,
      url: input.url,
      method: input.method,
      signingKey: generateSigningKey(),
    })

    ctx.analyticsClient.track('webhook_created', {
      webhook_id: createdWebhook.id,
      webhook_url: createdWebhook.url,
      webhook_method: createdWebhook.method,
      project_id: project.id,
      project_name: project.name,
    })

    return createdWebhook
  })

const getForProject = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const project = await ctx.prisma.project
      .findFirst({
        where: {
          team: { slug: input.teamSlug },
          slug: input.projectSlug,
        },
        include: {
          team: {
            include: {
              members: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get project',
        })
      })

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      })
    }

    const userInTeam = project.team.members.find((member) => member.user_id === ctx.user.id)

    if (!userInTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    const webhooks = await queries.webhooks.getForProject(ctx.prisma, {
      projectId: project.id,
    })

    return webhooks
  })

const update = authProcedure
  .input(
    z.object({
      id: z.string(),
      data: z
        .object({
          url: z.string().url(),
          method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
        })
        .partial(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const webhook = await ctx.prisma.webhook
      .findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          project: {
            select: {
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
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get webhook',
        })
      })

    if (!webhook) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Webhook not found',
      })
    }

    const userInTeam = webhook.project.team.members.find((member) => member.user_id === ctx.user.id)

    if (!userInTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    const updatedWebhook = await mutations.webhooks
      .updateWebhook(ctx.prisma, {
        id: webhook.id,
        data: {
          url: input.data.url,
          method: input.data.method,
        },
      })

      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update webhook',
        })
      })

    ctx.analyticsClient.track('webhook_updated', {
      webhook_id: updatedWebhook.id,
      webhook_url: updatedWebhook.url,
      webhook_method: updatedWebhook.method,
      project_id: updatedWebhook.project_id,
    })

    return updatedWebhook
  })

const _delete = authProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
  const webhook = await ctx.prisma.webhook
    .findUnique({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        project: {
          select: {
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
        },
      },
    })
    .catch(() => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get webhook',
      })
    })

  if (!webhook) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Webhook not found',
    })
  }

  const userInTeam = webhook.project.team.members.find((member) => member.user_id === ctx.user.id)

  if (!userInTeam) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not a member of this team',
    })
  }

  const deletedWebhook = await mutations.webhooks.deleteWekhook(ctx.prisma, {
    id: webhook.id,
  })

  ctx.analyticsClient.track('webhook_deleted', {
    webhook_id: deletedWebhook.id,
    webhook_url: deletedWebhook.url,
    webhook_method: deletedWebhook.method,
    project_id: deletedWebhook.project_id,
  })

  return deletedWebhook
})

export const webhooksRouter = createTRPCRouter({
  create,
  getForProject,
  update,
  delete: _delete,
})
