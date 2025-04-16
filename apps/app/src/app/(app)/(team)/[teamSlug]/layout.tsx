import { TrialEndedAlertServer } from '@/components/alerts/trial-ended-alert.server'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar-menus/sidebar'
import { TeamMenu } from '@/components/sidebar-menus/team-menu'
import { TeamsDropdown, TeamsDropdownSkeleton } from '@/components/teams-dropdown'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
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

  prefetch(trpc.users.me.queryOptions())
  prefetch(trpc.teams.getBySlug.queryOptions({ teamSlug }))
  prefetch(trpc.teams.getForUser.queryOptions())

  return (
    <>
      <TrialEndedAlertServer teamSlug={teamSlug} />

      <HydrateClient>
        <div className="grid grid-rows-[auto_1fr] h-full">
          <Header layout="team">
            <div className="flex gap-2 items-center">
              <Suspense fallback={<TeamsDropdownSkeleton />}>
                <TeamsDropdown />
              </Suspense>
            </div>
          </Header>

          <div className="flex">
            <Sidebar className="hidden sm:block">
              <TeamMenu />
            </Sidebar>
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </HydrateClient>
    </>
  )
}

export default TeamLayout
