import { createShortId, createSlug } from '@/lib/utils'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isMemberOfTeam } from '../middlewares/team'

const getForTeam = authProcedure
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .use(isMemberOfTeam)
  .query(async ({ ctx, input }) => {
    const projects = await ctx.prisma.project.findMany({
      where: {
        team: {
          slug: input.slug,
        },
      },
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
  // .use(isMemberOfTeam)
  .query(async ({ ctx, input }) => {
    const team = await ctx.prisma.team.findUnique({
      where: {
        slug: input.teamSlug,
      },
      select: {
        id: true,
      },
    })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const project = await ctx.prisma.project.findUnique({
      where: {
        team_id_slug: {
          slug: input.projectSlug,
          team_id: team.id,
        },

        // Make sure the user is a member of the team that the project belongs to
        team: {
          members: {
            some: {
              user_id: ctx.user.id,
            },
          },
        },
      },
    })

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      })
    }

    return project
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

    const createdProject = await ctx.prisma.project.create({
      data: {
        name: input.name,
        slug: `${createSlug(input.name)}-${createShortId()}`,
        created_by_user_id: ctx.user.id,
        team_id: team.id,
      },
    })

    return createdProject
  })

export const projectsRouter = createTRPCRouter({
  getBySlug,
  getForTeam,
  create,
})
