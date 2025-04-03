import { auth } from '@/lib/auth/auth'
import { handleInvitedUser } from '@/lib/auth/utils'
import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

type Params = Promise<{
  inviteCode: string
}>

export const GET = async (req: Request, { params }: { params: Params }) => {
  const { inviteCode } = await params

  if (!inviteCode) {
    notFound()
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    const joinedTeam = await handleInvitedUser(session.user, inviteCode)

    if (joinedTeam) {
      redirect(`/${joinedTeam.team.slug}`)
    }
  }

  const cookieStore = await cookies()
  cookieStore.set('invite-code', inviteCode)

  redirect(`/invite/${inviteCode}`)
}
