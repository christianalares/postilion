import type { PrismaClient } from '../client'
import type { ENUMS } from '../enums'

export const createInvite = async (
  prisma: PrismaClient,
  input: {
    code: string
    email: string
    role: keyof typeof ENUMS.TEAM_ROLE_ENUM
    teamId: string
    createdByUserId: string
  },
) => {
  const createdInvite = await prisma.teamInvite.create({
    data: {
      code: input.code,
      email: input.email,
      role: input.role,
      created_by_user_id: input.createdByUserId,
      team_id: input.teamId,
    },
  })

  return createdInvite
}
