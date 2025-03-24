import type { inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '../init'
import { domainsRouter } from './domains-router'
import { messagesRouter } from './messages-router'
import { projectsRouter } from './projects-router'
import { teamsRouter } from './teams-router'
import { usersRouter } from './users-router'
import { webhooksRouter } from './webhooks-router'

export const appRouter = createTRPCRouter({
  teams: teamsRouter,
  projects: projectsRouter,
  users: usersRouter,
  messages: messagesRouter,
  domains: domainsRouter,
  webhooks: webhooksRouter,
})

export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
