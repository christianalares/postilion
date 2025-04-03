import { auth } from '@/lib/auth/auth'
import { ForwardEmailClient } from '@/lib/forward-email-client'
import { createAnalyticsClient } from '@postilion/analytics/client'
import { prisma } from '@postilion/db'
import { TRPCError, initTRPC } from '@trpc/server'
import { headers } from 'next/headers'
import { cache } from 'react'
import superjson from 'superjson'

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user

  const analyticsClient = createAnalyticsClient({
    clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!,
    clientSecret: process.env.OPENPANEL_CLIENT_SECRET!,
    eventNames: [
      'team_updated',
      'team_created',
      'project_created',
      'project_updated',
      'user_updated',
      'domain_created',
      'domain_verified',
      'webhook_created',
      'webhook_updated',
      'webhook_deleted',
      'invite_created',
      'invite_deleted',
      'invite_accepted',
    ],
    profileId: user?.id,
  })

  return {
    prisma,
    user,
    analyticsClient,
  }
})

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const baseProcedure = t.procedure

export const authProcedure = t.procedure.use(async (opts) => {
  const { user } = opts.ctx

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const forwardEmailClient = new ForwardEmailClient(process.env.FORWARDEMAIL_API_TOKEN!)

  return opts.next({
    ctx: {
      ...opts.ctx,
      user,
      forwardEmailClient,
    },
  })
})
