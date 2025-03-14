import type { inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '../init'
import { organizationsRouter } from './organizations-router'
import { usersRouter } from './users-router'

export const appRouter = createTRPCRouter({
	organizations: organizationsRouter,
	users: usersRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
