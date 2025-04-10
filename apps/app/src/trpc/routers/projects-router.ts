import { createShortId, createSlug } from '@/lib/utils'
import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

const getForTeam = authProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const projects = await queries.projects
      .getProjectsForTeam(ctx.prisma, {
        teamSlug: input.slug,
        userId: ctx.user.id,
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching projects',
        })
      })

    // The member has to be a member of the team for all projects
    if (!projects.every((project) => project.team.members.some((member) => member.user_id === ctx.user.id))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    return projects
  })

const getBySlug = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const project = await queries.projects.getProjectBySlug(ctx.prisma, {
      teamSlug: input.teamSlug,
      projectSlug: input.projectSlug,
      userId: ctx.user.id,
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
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        select: {
          id: true,
          members: {
            select: {
              user_id: true,
              role: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userInTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userInTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (userInTeam.role !== 'OWNER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an owner of this team',
      })
    }

    const updatedProject = await mutations.projects.updateProject(ctx.prisma, {
      teamId: input.teamSlug,
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
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team.findUnique({
      where: {
        slug: input.teamSlug,
      },
      select: {
        id: true,
        members: true,
      },
    })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userInTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userInTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (userInTeam.role !== 'OWNER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: "You don't have permission to create projects in this team",
      })
    }

    const shortId = createShortId()

    const createdProject = await mutations.projects.createProject(ctx.prisma, {
      name: input.name,
      slug: `${createSlug(input.name)}-${shortId}`,
      shortId: shortId,
      createdByUserId: ctx.user.id,
      teamId: team.id,
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
