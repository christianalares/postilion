import { DomainsList } from '@/components/domains-list'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
}>

const TeamSettingsDomainsPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  trpc.domains.getForTeam.prefetch({ teamSlug })

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <DomainsList />
      </Suspense>
    </HydrateClient>
  )
}

export default TeamSettingsDomainsPage
