import { MessagesChart, MessagesChartSkeleton } from '@/components/charts/messages-chart'
import { DashboardInfo, DashboardInfoSkeleton } from '@/components/dashboard-info'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>

type Props = {
  params: Params
}

const ProjectPage = async ({ params }: Props) => {
  const { teamSlug, projectSlug } = await params

  trpc.dashboard.getStats.prefetch({ teamSlug, projectSlug, by: 'DAILY' })
  trpc.dashboard.getInfo.prefetch({ teamSlug, projectSlug })

  return (
    <HydrateClient>
      <div className="flex flex-col gap-8">
        <Suspense fallback={<MessagesChartSkeleton />}>
          <MessagesChart />
        </Suspense>

        <Suspense fallback={<DashboardInfoSkeleton />}>
          {/* <DashboardInfoSkeleton /> */}
          <DashboardInfo />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default ProjectPage
