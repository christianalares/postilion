import { createAnalyticsClient } from '@postilion/analytics/client'
import { prisma } from '@postilion/db'
import { createShortId, createSlug } from '../utils'
import type { auth } from './auth'

type User = (typeof auth.$Infer.Session)['user']

export const createDefaultTeam = async (user: User) => {
  const slug = createSlug(user.name)

  try {
    const createdTeam = await prisma.team.create({
      data: {
        name: user.name,
        slug: `${slug}-${createShortId()}`,
        members: {
          create: {
            user_id: user.id,
            role: 'OWNER',
          },
        },
        projects: {
          create: {
            name: 'Default',
            slug: 'default',
            created_by_user_id: user.id,
            short_id: createShortId(),
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    const analyticsClient = createAnalyticsClient({
      clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!,
      clientSecret: process.env.OPENPANEL_CLIENT_SECRET!,
      eventNames: ['default_team_created'],
      profileId: user.id,
    })

    analyticsClient.track('default_team_created', {
      team_id: createdTeam.id,
      team_name: createdTeam.name,
      team_slug: createdTeam.slug,
    })

    return createdTeam
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const handleInvitedUser = async (user: User, inviteCode: string) => {
  const invite = await prisma.teamInvite
    .findUnique({
      where: {
        code: inviteCode,
      },
      select: {
        id: true,
        email: true,
        team_id: true,
        role: true,
        team: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })
    .catch(() => {
      throw new Error('Invite not found')
    })

  if (!invite) {
    throw new Error('Invite not found')
  }

  if (invite.email !== user.email) {
    throw new Error('Invite email does not match user email')
  }

  const userOnTeam = await prisma.$transaction(async (tx) => {
    await tx.teamInvite.delete({
      where: {
        id: invite.id,
      },
    })

    const userOnTeam = await tx.userOnTeam.create({
      data: {
        user_id: user.id,
        team_id: invite.team_id,
        role: invite.role,
      },
      select: {
        team: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    })

    return userOnTeam
  })

  const analyticsClient = createAnalyticsClient({
    clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!,
    clientSecret: process.env.OPENPANEL_CLIENT_SECRET!,
    eventNames: ['invite_accepted'],
    profileId: user.id,
  })

  analyticsClient.track('invite_accepted', {
    invite_id: invite.id,
    user_id: user.id,
    team_id: invite.team_id,
    team_name: invite.team.name,
  })

  return userOnTeam
}
