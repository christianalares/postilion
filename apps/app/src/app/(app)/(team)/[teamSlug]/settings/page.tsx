import { TeamNameForm, TeamNameFormSkeleton } from '@/components/forms/team-name-form'
import { TeamManagement } from '@/components/team-management'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { TeamSettingsHeader } from './_header'

type Params = Promise<{
  teamSlug: string
}>

const TeamSettingsPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  prefetch(trpc.teams.getBySlug.queryOptions({ slug: teamSlug }))
  prefetch(trpc.invites.getForTeam.queryOptions({ teamSlug }))

  return (
    <HydrateClient>
      <TeamSettingsHeader />

      <div className="max-w-4xl space-y-8">
        <Suspense fallback={<TeamNameFormSkeleton />}>
          <TeamNameForm />
        </Suspense>

        <Suspense fallback="Loading...">
          <TeamManagement />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default TeamSettingsPage
