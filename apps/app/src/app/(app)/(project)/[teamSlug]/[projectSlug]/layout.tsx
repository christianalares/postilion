import { Header } from '@/components/header'
import { ProjectsDropdown } from '@/components/projects-dropdown'
import { ProjectMenu } from '@/components/sidebar-menus/project-menu'
import { Sidebar } from '@/components/sidebar-menus/sidebar'
import { TeamsDropdownSkeleton } from '@/components/teams-dropdown'
import { TeamsDropdown } from '@/components/teams-dropdown'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>

type Props = {
  children: React.ReactNode
  params: Params
}

const ProjectLayout = async ({ children, params }: Props) => {
  const { teamSlug, projectSlug } = await params

  prefetch(trpc.users.me.queryOptions())
  prefetch(trpc.projects.getForTeam.queryOptions({ slug: teamSlug }))
  prefetch(trpc.projects.getBySlug.queryOptions({ teamSlug, projectSlug }))
  prefetch(trpc.teams.getBySlug.queryOptions({ slug: teamSlug }))
  prefetch(trpc.teams.getForUser.queryOptions())

  return (
    <HydrateClient>
      <div className="grid grid-rows-[auto_1fr] h-full">
        <Header>
          <div className="flex gap-2 items-center">
            <Suspense fallback={<TeamsDropdownSkeleton />}>
              <TeamsDropdown />
            </Suspense>
            <span className="w-px bg-foreground/50 self-stretch scale-y-50 -skew-[15deg] mr-2" />
            <Suspense fallback={<TeamsDropdownSkeleton />}>
              <ProjectsDropdown />
            </Suspense>
          </div>
        </Header>
        <div className="flex">
          <Sidebar>
            <ProjectMenu />
          </Sidebar>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </HydrateClient>
  )
}

export default ProjectLayout
