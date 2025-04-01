'use client'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

type Props = {
  redirectTo: string
}

export const AcceptInviteLoginButtons = ({ redirectTo }: Props) => {
  const [isLoadingGithub, setIsLoadingGithub] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  const loginWithGitHub = async () => {
    setIsLoadingGithub(true)

    authClient.signIn.social({
      provider: 'github',
      callbackURL: redirectTo,
    })
  }

  const loginWithGoogle = async () => {
    setIsLoadingGoogle(true)

    authClient.signIn.social({
      provider: 'google',
      callbackURL: redirectTo,
    })
  }

  const disabled = isLoadingGithub || isLoadingGoogle

  return (
    <div className="flex flex-col gap-4 mt-8">
      <Button type="button" onClick={loginWithGitHub} loading={isLoadingGithub} disabled={disabled}>
        <Icon name="github" className="size-6" />
        Login with GitHub
      </Button>

      <Button type="button" onClick={loginWithGoogle} loading={isLoadingGoogle} disabled={disabled}>
        <Icon name="google" className="size-6" />
        Login with Google
      </Button>
    </div>
  )
}
