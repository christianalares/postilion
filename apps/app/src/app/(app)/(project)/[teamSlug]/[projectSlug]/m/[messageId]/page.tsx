import { MessageDetails, MessageDetailsSkeleton } from '@/components/message-details'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  messageId: string
}>

const MessagePage = async ({ params }: { params: Params }) => {
  const { messageId } = await params

  trpc.messages.getById.prefetch({ messageId })

  return (
    <HydrateClient>
      <Suspense fallback={<MessageDetailsSkeleton />}>
        <MessageDetails />
      </Suspense>
    </HydrateClient>
  )
}

export default MessagePage
