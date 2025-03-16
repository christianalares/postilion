import type { inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '../init'
import { messagesRouter } from './messages-router'
import { projectsRouter } from './projects-router'
import { teamsRouter } from './teams-router'
import { usersRouter } from './users-router'

export const appRouter = createTRPCRouter({
  teams: teamsRouter,
  projects: projectsRouter,
  users: usersRouter,
  messages: messagesRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
