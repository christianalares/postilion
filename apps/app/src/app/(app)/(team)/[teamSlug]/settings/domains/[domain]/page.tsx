import { DomainDetails } from '@/components/domain-details'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  domain: string
}>

const DomainPage = async ({ params }: { params: Params }) => {
  const { domain } = await params

  trpc.domains.getByDomain.prefetch({ domain })

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <DomainDetails />
      </Suspense>
    </HydrateClient>
  )
}

export default DomainPage
