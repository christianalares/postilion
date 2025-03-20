import { TeamNameForm, TeamNameFormSkeleton } from '@/components/forms/team-name-form'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { TeamSettingsHeader } from './_header'

type Params = Promise<{
  teamSlug: string
}>

const TeamSettingsPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  trpc.teams.getBySlug.prefetch({ slug: teamSlug })

  return (
    <HydrateClient>
      <TeamSettingsHeader />

      <div className="max-w-4xl">
        <Suspense fallback={<TeamNameFormSkeleton />}>
          <TeamNameForm />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default TeamSettingsPage
