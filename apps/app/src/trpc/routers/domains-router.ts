import { mutations } from '@postilion/db/mutations'
import { queries } from '@postilion/db/queries'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isTeamMember, isTeamOwner } from '../middlewares/team'

const getForTeam = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx }) => {
    const domains = await queries.domains
      .getByTeamId(ctx.prisma, {
        teamId: ctx.team.id,
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not fetch domains',
        })
      })

    const domainsFromForward = await Promise.all(
      domains.map((domain) => ctx.forwardEmailClient.getDomain({ domain: domain.domain })),
    ).catch((error) => {
      console.error(error)
      return []
    })

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
      teamSlug: z.string(),
      domain: z.string(),
    }),
  )
  .use(isTeamMember)
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
  .use(isTeamMember)
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
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const createdDomainOnForwardEmail = await ctx.forwardEmailClient.createDomain({ domain: input.domain })

    const createdDomain = await mutations.domains
      .createDomain(ctx.prisma, {
        teamId: ctx.team.id,
        domainName: input.domain,
        forwardemailId: createdDomainOnForwardEmail.id,
      })
      .catch(() => {
        // TODO: Rollback the domain (delete it) on forward email

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not create domain',
        })
      })

    ctx.analyticsClient.track('domain_created', {
      domain_id: createdDomain.id,
      domain_name: createdDomain.domain,
      team_id: ctx.team.id,
      team_name: ctx.team.name,
    })

    return createdDomain
  })

export const domainsRouter = createTRPCRouter({
  getForTeam,
  getByDomain,
  create,
  verify,
})
