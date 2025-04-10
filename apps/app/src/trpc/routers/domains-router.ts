import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
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

    const domains = await queries.domains
      .getByTeamId(ctx.prisma, {
        teamId: team.id,
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
    const domain = await queries.domains
      .getByDomainName(ctx.prisma, {
        userId: ctx.user.id,
        domainName: input.domain,
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
    const domain = await queries.domains
      .getByDomainName(ctx.prisma, {
        userId: ctx.user.id,
        domainName: input.domain,
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

    ctx.analyticsClient.track('domain_verified', {
      domain_id: domain.id,
      domain_name: domain.domain,
      team_id: domain.team_id,
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

    const createdDomainOnForwardEmail = await ctx.forwardEmailClient.createDomain({ domain: input.domain })

    const createdDomain = await mutations.domains
      .createDomain(ctx.prisma, {
        teamId: userOnTeam.team_id,
        domainName: input.domain,
        forwardemailId: createdDomainOnForwardEmail.id,
      })
      .catch(() => {
        // TODO: Rollback the domain on forward email

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not create domain',
        })
      })

    ctx.analyticsClient.track('domain_created', {
      domain_id: createdDomain.id,
      domain_name: createdDomain.domain,
      team_id: userOnTeam.team_id,
      team_name: userOnTeam.team.name,
    })

    return createdDomain
  })

export const domainsRouter = createTRPCRouter({
  getForTeam,
  getByDomain,
  create,
  verify,
})
