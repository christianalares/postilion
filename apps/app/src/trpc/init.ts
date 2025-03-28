import { auth } from '@/lib/auth/auth'
import { ForwardEmailClient } from '@/lib/forward-email-client'
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

  // TODO: Add analytics client
  return {
    prisma,
    user,
  }
})

export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const createCallerFactory = t.createCallerFactory

export const createTRPCRouter = t.router

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
