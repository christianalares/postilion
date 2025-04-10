import type { PrismaClient } from '../client'

export const getByTeamId = async (
  prisma: PrismaClient,
  input: {
    teamId: string
  },
) => {
  const invites = await prisma.teamInvite.findMany({
    where: {
      team_id: input.teamId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      created_by: {
        select: {
          name: true,
        },
      },
    },
  })

  return invites
}
