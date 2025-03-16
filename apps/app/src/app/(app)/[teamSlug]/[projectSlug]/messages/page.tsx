import { MessagesList } from '@/components/messages-list'
import { Suspense } from 'react'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>

type Props = {
  params: Params
}

const MessagesPage = async ({ params }: Props) => {
  // const { teamSlug, projectSlug } = await params

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesList />
    </Suspense>
  )
}

export default MessagesPage
