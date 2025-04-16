import { DomainDetails, DomainDetailsSkeleton } from '@/components/domain-details'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  domain: string
  teamSlug: string
}>

const DomainPage = async ({ params }: { params: Params }) => {
  const { domain, teamSlug } = await params

  prefetch(trpc.domains.getByDomain.queryOptions({ teamSlug, domain }))

  return (
    <HydrateClient>
      <Suspense fallback={<DomainDetailsSkeleton />}>
        <DomainDetails />
      </Suspense>
    </HydrateClient>
  )
}

export default DomainPage
