'use client'

import { useTRPC } from '@/trpc/client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export const TestComponent = () => {
  const [slug, setSlug] = useState('acme-support')

  const trpc = useTRPC()
  const {
    data: team,
    refetch,
    isFetching,
  } = useQuery({
    ...trpc.teams.testRoute.queryOptions({ teamSlug: slug }),
    enabled: false,
  })

  return (
    <div>
      <div>
        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <button type="button" onClick={() => refetch()}>
          Fetch team {isFetching ? '...' : ''}
        </button>
      </div>

      <p>Team: {team?.name}</p>
    </div>
  )
}
