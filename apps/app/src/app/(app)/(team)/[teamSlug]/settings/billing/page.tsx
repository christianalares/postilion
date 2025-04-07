import { NoSubscription } from '@/components/no-subscription'
import { ProductsList } from '@/components/products-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
}>

type Props = {
  params: Params
}

const BillingSettingsPage = async ({ params }: Props) => {
  const { teamSlug } = await params

  prefetch(trpc.billing.getSubscription.queryOptions({ teamSlug }))
  prefetch(trpc.billing.getProducts.queryOptions())

  return (
    <HydrateClient>
      <div className="max-w-4xl">
        <Suspense fallback={<div>Loading...</div>}>
          <NoSubscription />
          <ProductsList />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default BillingSettingsPage
