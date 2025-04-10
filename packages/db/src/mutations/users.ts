import type { PrismaClient } from '../client'

export const updateUser = async (
  prisma: PrismaClient,
  input: {
    userId: string
    data: Partial<{
      name: string
      email: string
    }>
  },
) => {
  const updatedUser = await prisma.user.update({
    where: {
      id: input.userId,
    },
    data: {
      name: input.data.name,
      email: input.data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return updatedUser
}
