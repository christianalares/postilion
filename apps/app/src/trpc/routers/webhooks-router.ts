import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isTeamMember } from '../middlewares/team'

const create = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
      url: z.string().url(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
      secret: z
        .string()
        .length(32, 'Secret must be 32 hexadecimal characters')
        .regex(/^[a-fA-F0-9]+$/, 'Secret must be hexadecimal characters only'),
    }),
  )
  .use(isTeamMember)
  .mutation(async ({ ctx, input }) => {
    const project = await ctx.prisma.project
      .findFirst({
        where: {
          team: { slug: input.teamSlug },
          slug: input.projectSlug,
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

    const createdWebhook = await mutations.webhooks.createWebhook(ctx.prisma, {
      projectId: project.id,
      url: input.url,
      method: input.method,
      secret: input.secret,
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
  .use(isTeamMember)
  .query(async ({ ctx, input }) => {
    const project = await ctx.prisma.project
      .findFirst({
        where: {
          team: { slug: input.teamSlug },
          slug: input.projectSlug,
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

    const webhooks = await queries.webhooks.getForProject(ctx.prisma, {
      projectId: project.id,
    })

    return webhooks
  })

const update = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      id: z.string(),
      data: z
        .object({
          url: z.string().url(),
          method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
          secret: z
            .string()
            .length(32, 'Secret must be 32 hexadecimal characters')
            .regex(/^[a-fA-F0-9]+$/, 'Secret must be hexadecimal characters only'),
        })
        .partial(),
    }),
  )
  .use(isTeamMember)
  .mutation(async ({ ctx, input }) => {
    const webhook = await ctx.prisma.webhook
      .findUnique({
        where: {
          id: input.id,
          project: {
            team_id: ctx.team.id,
          },
        },
        select: {
          id: true,
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

    const updatedWebhook = await mutations.webhooks
      .updateWebhook(ctx.prisma, {
        id: webhook.id,
        data: {
          url: input.data.url,
          method: input.data.method,
          secret: input.data.secret,
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

const _delete = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      id: z.string(),
    }),
  )
  .use(isTeamMember)
  .mutation(async ({ ctx, input }) => {
    const webhook = await ctx.prisma.webhook
      .findUnique({
        where: {
          id: input.id,
          project: {
            team_id: ctx.team.id,
          },
        },
        select: {
          id: true,
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
