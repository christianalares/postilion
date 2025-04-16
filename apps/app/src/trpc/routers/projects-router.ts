import { createShortId, createSlug } from '@/lib/utils'
import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isTeamMember, isTeamOwner } from '../middlewares/team'

const getForTeam = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx }) => {
    const projects = await queries.projects
      .getProjectsForTeam(ctx.prisma, {
        teamId: ctx.team.id,
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching projects',
        })
      })

    return projects
  })

const getBySlug = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx, input }) => {
    const project = await queries.projects.getProjectBySlug(ctx.prisma, {
      teamId: ctx.team.id,
      projectSlug: input.projectSlug,
    })

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      })
    }

    return project
  })

const update = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
      data: z
        .object({
          name: z.string(),
          domainId: z.string(),
        })
        .partial(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const updatedProject = await mutations.projects.updateProject(ctx.prisma, {
      teamId: ctx.team.id,
      projectSlug: input.projectSlug,
      data: {
        name: input.data.name,
        domainId: input.data.domainId,
      },
    })

    ctx.analyticsClient.track('project_updated', {
      project_id: updatedProject.id,
      ...(input.data.name && { project_name: updatedProject.name }),
      ...(input.data.domainId && { domain_id: input.data.domainId }),
    })

    return updatedProject
  })

const create = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      name: z.string(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const shortId = createShortId()

    const createdProject = await mutations.projects.createProject(ctx.prisma, {
      name: input.name,
      slug: `${createSlug(input.name)}-${shortId}`,
      shortId: shortId,
      createdByUserId: ctx.user.id,
      teamId: ctx.team.id,
    })

    ctx.analyticsClient.track('project_created', {
      project_id: createdProject.id,
      project_name: createdProject.name,
    })

    return createdProject
  })

export const projectsRouter = createTRPCRouter({
  getBySlug,
  getForTeam,
  create,
  update,
})
