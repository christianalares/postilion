import { Header } from '@/components/header'
import { TeamMenu } from '@/components/sidebar-menus/team-menu'
import { TeamsDropdown, TeamsDropdownSkeleton } from '@/components/teams-dropdown'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
}>

type Props = {
  children: React.ReactNode
  params: Params
}

const TeamLayout = async ({ children, params }: Props) => {
  const { teamSlug } = await params

  trpc.users.me.prefetch()
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
          </div>
        </Header>

        <div className="flex">
          <aside className="border-r min-w-52">
            <TeamMenu />
          </aside>

          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </HydrateClient>
  )
}

export default TeamLayout
