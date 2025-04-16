import { ProductsList, ProductsListSkeleton } from '@/components/products-list'
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
      <div className="p-4">
        <div className="max-w-4xl">
          <Suspense fallback={<ProductsListSkeleton />}>
            <ProductsList />
          </Suspense>
        </div>
      </div>
    </HydrateClient>
  )
}

export default BillingSettingsPage
