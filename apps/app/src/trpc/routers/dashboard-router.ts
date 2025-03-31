import { TRPCError } from '@trpc/server'
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  isSameDay,
  isSameMonth,
  isSameWeek,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

const getStats = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      projectSlug: z.string(),
      by: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
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
          team_id: team.id,
          slug: input.projectSlug,
        },
      },
      include: {
        team: true,
      },
    })

    if (!project) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Project not found',
      })
    }

    const now = new Date()
    const startDate =
      input.by === 'DAILY' ? startOfMonth(now) : input.by === 'WEEKLY' ? startOfWeek(now) : startOfYear(now)

    const messages = await ctx.prisma.message.findMany({
      where: {
        project_id: project.id,
        created_at: {
          gte: startDate,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
      select: {
        created_at: true,
      },
    })

    if (input.by === 'DAILY') {
      const allDays = eachDayOfInterval({
        start: startOfMonth(new Date()),
        end: new Date(),
      })

      const sorted = allDays.map((day) => {
        const entriesThisDay = messages.filter((msg) => isSameDay(msg.created_at, day))

        return {
          date: day,
          messages: entriesThisDay.length,
        }
      })

      return sorted
    }

    if (input.by === 'WEEKLY') {
      const allWeeks = eachWeekOfInterval({
        start: startOfMonth(new Date()),
        end: new Date(),
      })

      const sorted = allWeeks.map((week) => {
        const entriesThisWeek = messages.filter((msg) => isSameWeek(msg.created_at, week))

        return {
          date: week,
          messages: entriesThisWeek.length,
        }
      })

      return sorted
    }

    if (input.by === 'MONTHLY') {
      const allMonths = eachMonthOfInterval({
        start: startOfYear(new Date()),
        end: new Date(),
      })

      const sorted = allMonths.map((month) => {
        const entriesThisMonth = messages.filter((msg) => isSameMonth(msg.created_at, month))

        return {
          date: month,
          messages: entriesThisMonth.length,
        }
      })

      return sorted
    }

    return []
  })

const getInfo = authProcedure
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
          team_id: team.id,
          slug: input.projectSlug,
        },
      },
      include: {
        team: true,
        domain: true,
        messages: {
          select: {
            _count: true,
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

    return {
      domain: project.domain?.domain,
      numberOfMessages: project.messages.length,
      shortId: project.short_id,
    }
  })

export const dashboardRouter = createTRPCRouter({
  getStats,
  getInfo,
})
