import type { PrismaClient } from '../client'

export const getByTeamId = async (
  prisma: PrismaClient,
  input: {
    teamId: string
  },
) => {
  const domains = await prisma.domain.findMany({
    where: {
      team_id: input.teamId,
    },
    select: {
      id: true,
      domain: true,
      project: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  })

  return domains
}

export const getByDomainName = async (
  prisma: PrismaClient,
  input: {
    userId: string
    domainName: string
  },
) => {
  const domain = await prisma.domain.findUnique({
    where: {
      domain: input.domainName,
      // Make sure the domain is associated with the team the user is a member of
      team: {
        members: {
          some: {
            user_id: input.userId,
          },
        },
      },
    },
    omit: {
      forwardemail_id: true,
    },
    select: {
      id: true,
      domain: true,
      team_id: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  })

  return domain
}
