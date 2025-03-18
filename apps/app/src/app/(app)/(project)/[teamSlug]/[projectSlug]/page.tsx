import { MessagesList } from '@/components/messages-list'
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
  trpc.messages.getForProject.prefetch({ teamSlug, projectSlug })

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <MessagesList />
      </Suspense>
    </HydrateClient>
  )
}

export default ProjectPage
