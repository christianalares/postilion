import { DomainsList } from '@/components/domains-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { DomainHeader } from './_header'

type Params = Promise<{
  teamSlug: string
}>

const TeamSettingsDomainsPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  prefetch(trpc.domains.getForTeam.queryOptions({ teamSlug }))

  return (
    <HydrateClient>
      {/* TODO: Skeleton */}
      <DomainHeader />
      <Suspense fallback={<div>Loading...</div>}>
        <DomainsList />
      </Suspense>
    </HydrateClient>
  )
}

export default TeamSettingsDomainsPage
