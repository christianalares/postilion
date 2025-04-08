'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Alert, AlertDescription, AlertDialog, AlertHeader, AlertTitle } from '../ui/alert'
import { Button } from '../ui/button'

type Props = {
  needsSubscription: boolean
  teamSlug: string
}

export const TrialEndedAlert = ({ needsSubscription, teamSlug }: Props) => {
  const pathname = usePathname()

  const allowedRoutes = [`/${teamSlug}/settings`, `/${teamSlug}/settings/billing`]

  const showAlert = needsSubscription && !allowedRoutes.includes(pathname)

  return (
    <AlertDialog open={showAlert}>
      <Alert>
        <AlertHeader>
          <AlertTitle>Trial ended</AlertTitle>
          <AlertDescription>Your trial period has ended. Please upgrade to continue using Postilion.</AlertDescription>
        </AlertHeader>

        <Button asChild>
          <Link href={`/${teamSlug}/settings/billing`}>Go to billing page</Link>
        </Button>
      </Alert>
    </AlertDialog>
  )
}
