import { TeamNameForm, TeamNameFormSkeleton } from '@/components/settings/team-name-form'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
}>

const TeamSettingsPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  trpc.teams.getBySlug.prefetch({ slug: teamSlug })

  return (
    <HydrateClient>
      <div className="max-w-4xl">
        <Suspense fallback={<TeamNameFormSkeleton />}>
          <TeamNameForm />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default TeamSettingsPage
