import { MessageDetails, MessageDetailsSkeleton } from '@/components/message-details'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  messageId: string
}>

const MessagePage = async ({ params }: { params: Params }) => {
  const { messageId } = await params

  prefetch(trpc.messages.getById.queryOptions({ messageId }))

  return (
    <HydrateClient>
      <Suspense fallback={<MessageDetailsSkeleton />}>
        <MessageDetails />
      </Suspense>
    </HydrateClient>
  )
}

export default MessagePage
