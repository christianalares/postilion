import type { PrismaClient } from '../client'

export const createDomain = async (
  prisma: PrismaClient,
  input: {
    domainName: string
    forwardemailId: string
    teamId: string
  },
) => {
  const createdDomain = await prisma.domain.create({
    data: {
      domain: input.domainName,
      forwardemail_id: input.forwardemailId,
      team: {
        connect: {
          id: input.teamId,
        },
      },
    },
    select: {
      id: true,
      domain: true,
    },
  })

  return createdDomain
}
