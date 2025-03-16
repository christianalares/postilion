import { prisma } from '@postilion/db'
import { createShortId, createSlug } from '../utils'
import type { auth } from './auth'

type User = (typeof auth.$Infer.Session)['user']

export const createDefaultTeam = async (user: User) => {
  const shortId = createShortId()

  const slug = createSlug(user.name)

  try {
    const createdTeam = await prisma.team.create({
      data: {
        name: user.name,
        slug: `${slug}-${shortId}`,
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
          },
        },
      },
    })

    return createdTeam
  } catch (error) {
    console.error(error)
    throw error
  }
}
