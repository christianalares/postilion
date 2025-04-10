import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  isSameDay,
  isSameMonth,
  isSameWeek,
  subDays,
  subWeeks,
  subYears,
} from 'date-fns'
import type { PrismaClient } from '../client'

export const getStats = async (
  prisma: PrismaClient,
  input: {
    teamId: string
    projectSlug: string
    by: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  },
) => {
  const project = await prisma.project.findUnique({
    where: {
      team_id_slug: {
        team_id: input.teamId,
        slug: input.projectSlug,
      },
    },
    select: {
      id: true,
    },
  })

  if (!project) {
    throw new Error('Project not found')
  }

  const now = new Date()
  const startDate =
    input.by === 'DAILY' ? subDays(now, 30) : input.by === 'WEEKLY' ? subWeeks(now, 4) : subYears(now, 1)

  const messages = await prisma.message.findMany({
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
      start: startDate,
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
      start: startDate,
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
      start: startDate,
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
}

export const getInfo = async (
  prisma: PrismaClient,
  input: {
    teamId: string
    projectSlug: string
  },
) => {
  const project = await prisma.project.findUnique({
    where: {
      team_id_slug: {
        team_id: input.teamId,
        slug: input.projectSlug,
      },
    },
    select: {
      short_id: true,
      domain: {
        select: {
          domain: true,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  })

  if (!project) {
    const error = new Error('Project not found')
    error.name = 'PROJECT_NOT_FOUND'

    throw error
  }

  return {
    domain: project.domain?.domain,
    numberOfMessages: project._count.messages,
    shortId: project.short_id,
  }
}
