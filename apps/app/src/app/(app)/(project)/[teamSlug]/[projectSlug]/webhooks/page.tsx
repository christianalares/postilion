import { WebhooksList } from '@/components/webhooks-list'
import { HydrateClient, trpc } from '@/trpc/server'
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

  trpc.webhooks.getForProject.prefetch({ teamSlug, projectSlug })

  return (
    <HydrateClient>
      <WebhooksHeader />

      <Suspense fallback={<div>Loading...</div>}>
        <WebhooksList />
      </Suspense>
    </HydrateClient>
  )
}

export default WebhooksPage
