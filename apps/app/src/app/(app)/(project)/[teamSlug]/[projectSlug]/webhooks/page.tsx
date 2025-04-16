import { WebhooksList } from '@/components/webhooks-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { WebhooksHeader } from './_header'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>

type Props = {
  params: Params
}

const WebhooksPage = async ({ params }: Props) => {
  const { teamSlug, projectSlug } = await params

  prefetch(trpc.webhooks.getForProject.queryOptions({ teamSlug, projectSlug }))

  return (
    <HydrateClient>
      <WebhooksHeader />

      <div className="p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <WebhooksList />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default WebhooksPage
