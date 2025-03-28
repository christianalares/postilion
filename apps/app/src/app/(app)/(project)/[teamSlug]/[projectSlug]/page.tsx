import { MessagesChart } from '@/components/charts/messages-chart'
import { DashboardInfo } from '@/components/dashboard-info'
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
        <Suspense fallback={<p>Loading...</p>}>
          <MessagesChart />
        </Suspense>

        <Suspense fallback={<p>Loading...</p>}>
          <DashboardInfo />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default ProjectPage
