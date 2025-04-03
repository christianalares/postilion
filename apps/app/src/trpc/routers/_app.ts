import type { inferRouterOutputs } from '@trpc/server'
import { createTRPCRouter } from '../init'
import { dashboardRouter } from './dashboard-router'
import { domainsRouter } from './domains-router'
import { invitesRouter } from './invites-router'
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
  dashboard: dashboardRouter,
  domains: domainsRouter,
  webhooks: webhooksRouter,
  invites: invitesRouter,
})

export type AppRouter = typeof appRouter
export type RouterOutputs = inferRouterOutputs<AppRouter>
