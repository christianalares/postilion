import { MessagesList } from '@/components/messages-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
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

  prefetch(trpc.messages.getForProject.queryOptions({ teamSlug, projectSlug }))

  return (
    <HydrateClient>
      <div className="p-4 h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <MessagesList />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default ProjectPage
