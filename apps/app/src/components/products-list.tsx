'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'

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
          <ProductCard
            key={product.id}
            product={product}
            currentIndex={i}
            currentPlanIndex={currentSubscriptionIndex}
          />
        )
      })}
    </ul>
  )
}

type ProductCardProps = {
  product: RouterOutputs['billing']['getProducts'][number]
  currentIndex: number
  currentPlanIndex: number | null
}

const ProductCard = ({ product, currentIndex, currentPlanIndex }: ProductCardProps) => {
  const teamSlug = useTeamSlug()
  const queryClient = useQueryClient()
  const trpc = useTRPC()
  const { data: subscription } = useSuspenseQuery(trpc.billing.getSubscription.queryOptions({ teamSlug }))

  const afterMutation = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.billing.getSubscription.queryKey({ teamSlug }),
    })
    queryClient.invalidateQueries({
      queryKey: trpc.billing.getProducts.queryKey(),
    })
  }

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
      onSuccess: (_updatedSubscription) => {
        afterMutation()
      },
    }),
  )

  const cancelSubscriptionMutation = useMutation(
    trpc.billing.cancelSubscription.mutationOptions({
      onSuccess: () => {
        toast.success('Subscription cancelled')
        afterMutation()
      },
      onError: () => {
        toast.error('Failed to cancel subscription')
      },
    }),
  )

  const reactivateSubscriptionMutation = useMutation(
    trpc.billing.reactivateSubscription.mutationOptions({
      onSuccess: (_reactivatedSubscription) => {
        toast.success('Subscription reactivated')
        afterMutation()
      },
      onError: (_error) => {
        toast.error('Failed to reactivate subscription')
      },
    }),
  )

  const isCurrentSubscription = subscription?.productId === product.id

  const isNoSubscription = !subscription
  const isDowngrade = subscription && currentPlanIndex !== null && currentPlanIndex > currentIndex
  const isUpgrade = subscription && currentPlanIndex !== null && currentPlanIndex < currentIndex
  const isOngoingSubscription = subscription && isCurrentSubscription && !subscription.endsAt
  const isCanceledSubscription = subscription && isCurrentSubscription && subscription.endsAt

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <div>
          <CardTitle className="font-mono text-2xl font-normal">{product.name}</CardTitle>
          <CardDescription className="font-mono mt-2">{product.description}</CardDescription>
        </div>

        <div>
          <p className="font-mono text-2xl">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: product.price.currency,
            }).format(product.price.amount / 100)}
            <span className="text-muted-foreground text-sm"> / month</span>
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex justify-between items-center gap-4">
        {isCurrentSubscription && subscription?.endsAt && (
          <Badge variant="warning" label="Ends at:">
            {new Date(subscription.endsAt).toLocaleDateString()}
          </Badge>
        )}

        <div className="ml-auto flex gap-2">
          {isNoSubscription && (
            <Button
              loading={createCheckoutMutation.isPending}
              className="ml-auto"
              onClick={() => {
                createCheckoutMutation.mutate({ teamSlug, productId: product.id })
              }}
            >
              Choose tier
            </Button>
          )}

          {isDowngrade && (
            <Button
              loading={updateSubscriptionMutation.isPending}
              className="ml-auto"
              onClick={() => {
                updateSubscriptionMutation.mutate({ teamSlug, productId: product.id })
              }}
            >
              Downgrade
            </Button>
          )}

          {isUpgrade && (
            <Button
              loading={updateSubscriptionMutation.isPending}
              className="ml-auto"
              onClick={() => {
                updateSubscriptionMutation.mutate({ teamSlug, productId: product.id })
              }}
            >
              Upgrade
            </Button>
          )}

          {isOngoingSubscription && (
            <>
              <Button
                loading={cancelSubscriptionMutation.isPending}
                variant="destructive"
                onClick={() => {
                  cancelSubscriptionMutation.mutate({ teamSlug })
                }}
              >
                Cancel
              </Button>
              <Button
                loading={createPortalMutation.isPending}
                variant="secondary"
                onClick={() => {
                  createPortalMutation.mutate({ teamSlug })
                }}
              >
                Manage
              </Button>
            </>
          )}

          {isCanceledSubscription && (
            <>
              <Button
                loading={reactivateSubscriptionMutation.isPending}
                onClick={() => {
                  reactivateSubscriptionMutation.mutate({ teamSlug })
                }}
              >
                Reactivate
              </Button>

              <Button
                loading={createPortalMutation.isPending}
                variant="secondary"
                onClick={() => {
                  createPortalMutation.mutate({ teamSlug })
                }}
              >
                Manage
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const ProductsListSkeleton = () => {
  return (
    <ul className="space-y-6">
      {new Array(3).fill(null).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <Card key={i}>
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle className="font-mono text-2xl font-normal">Tier {i + 1}</CardTitle>
              <CardDescription className="font-mono mt-2">
                <Skeleton className="w-52 h-5" />
              </CardDescription>
            </div>

            <div className="flex items-end gap-2">
              <Skeleton className="h-10 w-24" />
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
          </CardHeader>

          <CardContent className="flex justify-between items-center gap-4">
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-9 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </ul>
  )
}
