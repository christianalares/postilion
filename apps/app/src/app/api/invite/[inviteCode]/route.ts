import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

type Params = Promise<{
  inviteCode: string
}>

export const GET = async (req: Request, { params }: { params: Params }) => {
  const { inviteCode } = await params

  if (!inviteCode) {
    notFound()
  }

  // TODO: Check if the visitor is logged in, if so, add them to the team and redirect to the team dashboard

  const cookieStore = await cookies()
  cookieStore.set('invite-code', inviteCode)

  redirect(`/invite/${inviteCode}`)
}
