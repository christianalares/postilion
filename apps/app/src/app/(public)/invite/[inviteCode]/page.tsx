import { setInviteCookie } from '@/actions'
import { AcceptInviteLoginButtons } from '@/components/accept-invite-login-buttons'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ThreeDBox } from '@/components/ui/three-d-box'
import { trpc } from '@/trpc/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ThemeSwitcherWrapper } from '../../login/theme-switcher-wrapper'

type Params = Promise<{
  inviteCode: string
}>

type Props = {
  params: Params
}

const InvitePage = async ({ params }: Props) => {
  const { inviteCode: inviteCodeParam } = await params
  const cookieStore = await cookies()
  const inviteCodeCookie = cookieStore.get('invite-code')?.value

  if (inviteCodeParam !== inviteCodeCookie) {
    notFound()
  }

  const invite = await trpc.invites.get({ code: inviteCodeParam }).catch(() => {
    notFound()
  })

  if (!invite) {
    notFound()
  }

  const invitedByAndTeamNameIsTheSame = invite.created_by.name === invite.team.name

  return (
    <div className="h-full grid grid-rows-[auto_1fr]">
      <header className="flex items-center justify-between p-8">
        <Logo />

        <ThemeSwitcherWrapper />
      </header>

      <main className="flex items-center justify-center">
        <ThreeDBox>
          <h1 className="font-mono">You've been invited! 🎉</h1>

          <p className="text-muted-foreground mt-2">
            {invitedByAndTeamNameIsTheSame ? (
              <>
                <span className="text-foreground">{invite.created_by.name}</span> invited you to join their team.
              </>
            ) : (
              <>
                <span className="text-foreground">{invite.created_by.name}</span> invited you to join the team{' '}
                <span className="text-foreground">{invite.team.name}</span>.
              </>
            )}
          </p>

          <AcceptInviteLoginButtons redirectTo={`/${invite.team.slug}`} />
        </ThreeDBox>
      </main>
    </div>
  )
}

export default InvitePage
