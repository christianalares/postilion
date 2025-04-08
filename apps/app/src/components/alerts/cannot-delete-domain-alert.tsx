'use client'

import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertHeader, AlertTitle } from '@/components/ui/alert'

type Props = {
  reason: React.ReactNode
}

export const CannotDeleteDomainAlert = ({ reason }: Props) => {
  return (
    <Alert>
      <AlertHeader>
        <AlertTitle>Cannot delete domain</AlertTitle>
        <AlertDescription>{reason}</AlertDescription>
      </AlertHeader>

      <AlertFooter>
        <AlertCancel>OK</AlertCancel>
      </AlertFooter>
    </Alert>
  )
}
