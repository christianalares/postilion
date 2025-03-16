import { MessageDetails, MessageDetailsSkeleton } from '@/components/message-details'
import { trpc } from '@/trpc/server'
import { Suspense } from 'react'

type Params = Promise<{
  messageId: string
}>

const MessagePage = async ({ params }: { params: Params }) => {
  const { messageId } = await params

  trpc.messages.getById.prefetch({ messageId })

  return (
    <Suspense fallback={<MessageDetailsSkeleton />}>
      <MessageDetails />
    </Suspense>
  )
}

export default MessagePage
