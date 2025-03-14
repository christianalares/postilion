'use client'

import { authClient } from '@/lib/auth/auth-client'
import { useState } from 'react'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

type Props = {
  redirectTo?: string
}

export const LoginButtons = ({ redirectTo }: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const loginWithGitHub = async () => {
    setIsLoading(true)

    authClient.signIn.social({
      provider: 'github',
      callbackURL: redirectTo ?? '/',
    })
  }

  return (
    <div className="border p-8 bg-background relative after:absolute after:inset-0 after:translate-3 after:border after:border-border after:bg-foreground/2 after:z-[-1]">
      <h1 className="text-2xl">Login to Postilion</h1>
      <p className="text-sm text-muted-foreground mt-2">Login to Postilion using GitHub to continue.</p>

      <div className="mt-8">
        <Button type="button" onClick={loginWithGitHub} loading={isLoading}>
          <Icon name="github" className="size-6" />
          Login with GitHub
        </Button>
      </div>
    </div>
  )
}
