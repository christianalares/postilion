import { trpc } from '@/trpc/server'
import { z } from 'zod'

type Params = Promise<{ teamSlug: string }>

type Props = {
  params: Params
}

const TeamPage = async ({ params }: Props) => {
  const { teamSlug } = await params

  const me = await trpc.users.me()

  return (
    <div>
      <h1>Welcome, {me.name}</h1>
    </div>
  )
}

export default TeamPage
