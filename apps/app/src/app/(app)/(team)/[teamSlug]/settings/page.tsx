import { TeamNameForm, TeamNameFormSkeleton } from '@/components/forms/team-name-form'
import { TeamManagement } from '@/components/team-management'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { TeamSettingsHeader } from './_header'

type Params = Promise<{
  teamSlug: string
}>

const TeamSettingsPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  trpc.teams.getBySlug.prefetch({ slug: teamSlug })
  trpc.invites.getForTeam.prefetch({ teamSlug })

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
