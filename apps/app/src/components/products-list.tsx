'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'

import { Button } from './ui/button'

export const ProductsList = () => {
  const teamSlug = useTeamSlug()
  const trpc = useTRPC()
  const { data: products } = useSuspenseQuery(trpc.billing.getProducts.queryOptions())
  const { data: subscription } = useSuspenseQuery(trpc.billing.getSubscription.queryOptions({ teamSlug }))

  const currentSubscriptionIndex = subscription ? products.findIndex((p) => p.id === subscription.productId) : null

  return (
    <ul className="space-y-6">
      {products.map((product, i) => {
        return (
          <TierCard key={product.id} product={product} currentIndex={i} currentPlanIndex={currentSubscriptionIndex} />
        )
      })}
    </ul>
  )
}

type TierCardProps = {
  product: RouterOutputs['billing']['getProducts'][number]
  currentIndex: number
  currentPlanIndex: number | null
}

const TierCard = ({ product, currentIndex, currentPlanIndex }: TierCardProps) => {
  const teamSlug = useTeamSlug()
  const trpc = useTRPC()
  const { data: subscription } = useSuspenseQuery(trpc.billing.getSubscription.queryOptions({ teamSlug }))

  const createPortalMutation = useMutation(
    trpc.billing.createPortal.mutationOptions({
      onSuccess: (createdPortal) => {
        location.href = createdPortal.url
      },
    }),
  )

  const createCheckoutMutation = useMutation(
    trpc.billing.createCheckout.mutationOptions({
      onSuccess: (createdCheckout) => {
        location.href = createdCheckout.url
      },
    }),
  )

  const updateSubscriptionMutation = useMutation(
    trpc.billing.updateSubscription.mutationOptions({
      onSuccess: (updatedSubscription) => {
        // console.log(updatedSubscription)
      },
    }),
  )

  const isCurrentSubscription = subscription?.productId === product.id

  const buttonLabel = isCurrentSubscription
    ? 'Manage'
    : !subscription
      ? 'Choose tier'
      : currentPlanIndex !== null && currentPlanIndex > currentIndex
        ? 'Downgrade'
        : 'Upgrade'

  const handleClick = () => {
    if (isCurrentSubscription) {
      createPortalMutation.mutate({ teamSlug })
      return
    }

    if (!subscription) {
      createCheckoutMutation.mutate({ teamSlug, productId: product.id })
      return
    }

    updateSubscriptionMutation.mutate({ teamSlug, productId: product.id })
  }

  const isLoading =
    createPortalMutation.isPending ||
    createPortalMutation.isSuccess ||
    createCheckoutMutation.isPending ||
    createCheckoutMutation.isSuccess ||
    updateSubscriptionMutation.isPending

  return (
    <li
      className={cn('border p-8', {
        'border-foreground/50': isCurrentSubscription,
      })}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-2xl flex items-center gap-2">{product.name}</h2>
          <p className="text-muted-foreground font-mono text-sm mt-2">{product.description}</p>
        </div>

        <div>
          <p className="font-mono text-2xl">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.price.currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 1,
            }).format(product.price.amount / 100)}
            <span className="text-muted-foreground text-sm"> / month</span>
          </p>
        </div>
      </div>

      <div className={cn('mt-8 flex justify-between')}>
        <Button
          loading={isLoading}
          className="ml-auto"
          variant={isCurrentSubscription ? 'secondary' : 'default'}
          onClick={handleClick}
        >
          {buttonLabel}
        </Button>
      </div>
    </li>
  )
}
