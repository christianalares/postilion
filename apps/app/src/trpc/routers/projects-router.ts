import { createShortId, createSlug } from '@/lib/utils'
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
    const team = await ctx.prisma.team.findUnique({
      where: {
        slug: input.slug,
      },
      select: {
        id: true,
        members: {
          select: {
            user_id: true,
          },
        },
      },
    })

    if (!team?.members.some((member) => member.user_id === ctx.user.id)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    const projects = await ctx.prisma.project
      .findMany({
        where: {
          team: {
            slug: input.slug,
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error fetching projects',
        })
      })

    if (!projects) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No projects found',
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
      include: {
        domain: {
          select: {
            id: true,
            domain: true,
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

    const updatedProject = await ctx.prisma.project.update({
      where: {
        team_id_slug: {
          slug: input.projectSlug,
          team_id: team.id,
        },
      },
      data: {
        name: input.data.name,
        domain: input.data.domainId ? { connect: { id: input.data.domainId } } : undefined,
      },
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

    const createdProject = await ctx.prisma.project.create({
      data: {
        name: input.name,
        slug: `${createSlug(input.name)}-${shortId}`,
        short_id: shortId,
        created_by_user_id: ctx.user.id,
        team_id: team.id,
      },
    })

    return createdProject
  })

const connectDomain = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
      domainId: z.string(),
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

    const updatedProject = await ctx.prisma.project.update({
      where: {
        team_id_slug: {
          slug: input.projectSlug,
          team_id: team.id,
        },
      },
      data: {
        domain: {
          connect: {
            id: input.domainId,
          },
        },
      },
    })

    return updatedProject
  })

export const projectsRouter = createTRPCRouter({
  getBySlug,
  getForTeam,
  create,
  update,
})
