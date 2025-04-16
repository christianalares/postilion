'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { differenceInMilliseconds } from 'date-fns'
import Link from 'next/link'

export const TrialCountdownMessage = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()

  const { data: team } = useSuspenseQuery(trpc.teams.getBySlug.queryOptions({ teamSlug }))

  if (!team.subscription_id && team.end_free_trial) {
    const daysLeft = Math.max(
      0,
      Math.ceil(differenceInMilliseconds(team.end_free_trial, new Date()) / (1000 * 60 * 60 * 24)),
    )

    return (
      <div className="p-3 trial-countdown">
        <Link
          href={`/${teamSlug}/settings/billing`}
          className={cn(
            'block text-xs text-center font-mono border p-2 opacity-70 hover:opacity-100 transition-opacity',
            daysLeft === 0
              ? 'text-destructive bg-destructive/10 border-destructive'
              : 'text-warning bg-warning/10 border-warning',
          )}
        >
          {daysLeft === 0 ? (
            'Free trial has ended'
          ) : (
            <>
              Free trial ends in <span className="font-bold">{daysLeft}</span> days
            </>
          )}
        </Link>
      </div>
    )
  }

  return null
}
