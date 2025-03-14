import { prisma } from '@postilion/db'
import { customAlphabet } from 'nanoid'
import { createSlug } from '../utils'
import type { auth } from './auth'

const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

type User = (typeof auth.$Infer.Session)['user']

export const createDefaultTeam = async (user: User) => {
  const nanoId = createId()

  const slug = createSlug(user.name)

  try {
    const createdTeam = await prisma.team.create({
      data: {
        name: user.name,
        slug: `${slug}-${nanoId}`,
        members: {
          create: {
            user_id: user.id,
            role: 'OWNER',
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
