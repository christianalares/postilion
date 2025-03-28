'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import NumberFlow from '@number-flow/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export const DashboardInfo = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const [info] = trpc.dashboard.getInfo.useSuspenseQuery({
    teamSlug,
    projectSlug,
  })

  return (
    <Card className="xl:w-1/2">
      <CardHeader>
        <CardTitle>Information</CardTitle>
        <CardDescription>Some handy information about this project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-t pt-6 flex gap-8">
          {info.domain ? (
            <div className="flex-1 border border-dashed p-4">
              <p className="text-xs uppercase text-muted-foreground">Connected domain</p>
              <p className="font-mono mt-2">{info.domain}</p>

              <p className="text-muted-foreground mt-4">All emails sent to this address will be forwarded.</p>
            </div>
          ) : (
            <div className="flex-1 border border-dashed p-4">
              <p className="text-xs uppercase text-muted-foreground">Connected email address</p>
              <p className="font-mono mt-2">{info.shortId}@postilion.ai</p>

              <p className="text-muted-foreground mt-4">All emails sent to this address will be forwarded.</p>
            </div>
          )}

          <div className="flex-1 border border-dashed p-4">
            <p className="text-xs uppercase text-muted-foreground">Total messages sent</p>
            <NumberOfMessages nr={info.numberOfMessages} />
            {/* <p className="font-mono mt-2 text-3xl">{info.numberOfMessages}</p> */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const NumberOfMessages = ({ nr }: { nr: number }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const displayValue = !isMounted ? 0 : nr

  return <NumberFlow className="font-mono mt-2 text-3xl" value={displayValue} />
}
