import { MessagesChart } from '@/components/charts/messages-chart'
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

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading...</p>}>
        <MessagesChart />
      </Suspense>
    </HydrateClient>
  )
}

export default ProjectPage
