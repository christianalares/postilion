import { ForwardEmailClient } from '@/lib/forward-email-client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

const getForTeam = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const userOnTeam = await ctx.prisma.userOnTeam
      .findFirst({
        where: {
          team: {
            slug: input.teamSlug,
          },
          user_id: ctx.user.id,
        },
        include: {
          team: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not fetch user on team',
        })
      })

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    const { team } = userOnTeam

    const domains = await ctx.prisma.domain
      .findMany({
        where: {
          team: {
            id: team.id,
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not fetch domains',
        })
      })

    const domainsFromForward = await Promise.all(
      domains.map((domain) => ctx.forwardEmailClient.getDomain({ domain: domain.domain })),
    )

    const finalResults = domains.map((domain, index) => {
      const domainFromForwardRaw = domainsFromForward[index]

      const domainFromForward = !domainFromForwardRaw
        ? {}
        : 'error' in domainFromForwardRaw
          ? {}
          : { forward: domainFromForwardRaw }

      return {
        ...domain,
        ...domainFromForward,
      }
    })

    return finalResults
  })

const getByDomain = authProcedure
  .input(
    z.object({
      domain: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const domain = await ctx.prisma.domain
      .findUnique({
        where: {
          domain: input.domain,
          team: {
            // Make sure the domain is associated with the team the user is a member of
            members: {
              some: {
                user_id: ctx.user.id,
              },
            },
          },
        },
        omit: {
          forwardemail_id: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not fetch domain',
        })
      })

    if (!domain) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Domain not found',
      })
    }

    const domainOnForwardEmail = await ctx.forwardEmailClient.getDomain({ domain: domain.domain })

    if ('error' in domainOnForwardEmail) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not fetch domain',
      })
    }

    return {
      ...domain,
      has_mx_record: domainOnForwardEmail.has_mx_record,
      has_txt_record: domainOnForwardEmail.has_txt_record,
      verification_record: domainOnForwardEmail.verification_record,
    }
  })

const verify = authProcedure
  .input(
    z.object({
      domain: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const domain = await ctx.prisma.domain
      .findUnique({
        where: {
          domain: input.domain,
          team: {
            // Make sure the domain is associated with the team the user is a member of
            members: {
              some: {
                user_id: ctx.user.id,
              },
            },
          },
        },
        omit: {
          forwardemail_id: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not fetch domain',
        })
      })

    if (!domain) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Domain not found',
      })
    }

    const status = await ctx.forwardEmailClient.verifyDomain({ domain: domain.domain }).catch((_error) => {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not verify domain',
      })
    })

    return status
  })

const create = authProcedure
  .input(
    z.object({
      domain: z.string(),
      teamSlug: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userOnTeam = await ctx.prisma.userOnTeam
      .findFirst({
        where: {
          team: {
            slug: input.teamSlug,
          },
          user_id: ctx.user.id,
        },
        include: {
          team: true,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not fetch user on team',
        })
      })

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (userOnTeam.role !== 'OWNER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an owner of this team',
      })
    }

    const createdDomain = await ctx.prisma.$transaction(async (tx) => {
      const data = await ctx.forwardEmailClient.createDomain({ domain: input.domain })

      const createdDomain = await ctx.prisma.domain.create({
        data: {
          domain: input.domain,
          forwardemail_id: data.id,
          team: {
            connect: {
              id: userOnTeam.team_id,
            },
          },
        },
        omit: {
          forwardemail_id: true,
        },
      })

      return createdDomain
    })

    return createdDomain
  })

export const domainsRouter = createTRPCRouter({
  getForTeam,
  getByDomain,
  create,
  verify,
})
