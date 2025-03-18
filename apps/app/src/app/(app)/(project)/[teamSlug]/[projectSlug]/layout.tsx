import { Header } from '@/components/header'
import { ProjectsDropdown } from '@/components/projects-dropdown'
import { ProjectMenu } from '@/components/sidebar-menus/project-menu'
import { TeamsDropdownSkeleton } from '@/components/teams-dropdown'
import { TeamsDropdown } from '@/components/teams-dropdown'
import { HydrateClient, trpc } from '@/trpc/server'
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

  trpc.users.me.prefetch()
  trpc.projects.getForTeam.prefetch({ slug: teamSlug })
  trpc.projects.getBySlug.prefetch({ teamSlug, projectSlug })
  trpc.teams.getBySlug.prefetch({ slug: teamSlug })
  trpc.teams.getForUser.prefetch()

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
          <aside className="border-r min-w-52">
            <ProjectMenu />
          </aside>

          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </HydrateClient>
  )
}

export default ProjectLayout
