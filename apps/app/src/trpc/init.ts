import { auth } from '@/lib/auth/auth'
import { ForwardEmailClient } from '@/lib/forward-email-client'
import { createAnalyticsClient } from '@postilion/analytics/client'
import { PolarClient } from '@postilion/billing'
import { prisma } from '@postilion/db'
import { EmailClient } from '@postilion/email/client'
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
    profileId: user?.id,
  })

  const emailClient = new EmailClient(process.env.RESEND_API_KEY!)
  const polarClient = new PolarClient(process.env.POLAR_ACCESS_TOKEN!)

  return {
    prisma,
    user,
    analyticsClient,
    emailClient,
    polarClient,
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
