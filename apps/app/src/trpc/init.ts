// import { analyticsClient } from '@/lib/analytics'
import { auth } from '@/lib/auth'
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

	return {
		prisma,
		user,
		// analyticsClient,
	}
})

const t = initTRPC.context<typeof createTRPCContext>().create({
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

	return opts.next({
		ctx: {
			...opts.ctx,
			user,
		},
	})
})
