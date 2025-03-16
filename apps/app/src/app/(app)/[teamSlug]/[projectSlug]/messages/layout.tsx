import { trpc } from '@/trpc/server'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>

type Props = {
  children: React.ReactNode
  params: Params
}

const MessagesLayout = async ({ children, params }: Props) => {
  const { teamSlug, projectSlug } = await params

  trpc.messages.getForProject.prefetch({ teamSlug, projectSlug })

  return children
}

export default MessagesLayout
