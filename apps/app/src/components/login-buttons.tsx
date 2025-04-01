'use client'

import { authClient } from '@/lib/auth/auth-client'
import { useState } from 'react'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { ThreeDBox } from './ui/three-d-box'

type Props = {
  redirectTo?: string
}

export const LoginButtons = ({ redirectTo }: Props) => {
  const [isLoadingGithub, setIsLoadingGithub] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  const loginWithGitHub = async () => {
    setIsLoadingGithub(true)

    authClient.signIn.social({
      provider: 'github',
      callbackURL: redirectTo ?? '/',
    })
  }

  const loginWithGoogle = async () => {
    setIsLoadingGoogle(true)

    authClient.signIn.social({
      provider: 'google',
      callbackURL: redirectTo ?? '/',
    })
  }

  const disabled = isLoadingGithub || isLoadingGoogle

  return (
    <ThreeDBox>
      <h1 className="text-2xl">Login to Postilion</h1>
      <p className="text-sm text-muted-foreground mt-2">Login to Postilion using your preferred provider.</p>

      <div className="mt-8 flex flex-col gap-4">
        <Button type="button" onClick={loginWithGitHub} loading={isLoadingGithub} disabled={disabled}>
          <Icon name="github" className="size-6" />
          Login with GitHub
        </Button>

        <Button type="button" onClick={loginWithGoogle} loading={isLoadingGoogle} disabled={disabled}>
          <Icon name="google" className="size-6" />
          Login with Google
        </Button>
      </div>
    </ThreeDBox>
  )
}
