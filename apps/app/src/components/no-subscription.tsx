'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'

export const NoSubscription = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()

  const { data: subscription } = useSuspenseQuery(trpc.billing.getSubscription.queryOptions({ teamSlug }))

  if (subscription) {
    return null
  }

  return <div>No subscription</div>
}
