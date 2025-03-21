'use client'

import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertTitle } from '@/components/ui/alert'
import { DialogHeader } from '../ui/dialog'

type Props = {
  reason: React.ReactNode
}

export const CannotDeleteDomainAlert = ({ reason }: Props) => {
  return (
    <Alert>
      <DialogHeader>
        <AlertTitle>Cannot delete domain</AlertTitle>
        <AlertDescription>This domain cannot be deleted.</AlertDescription>
      </DialogHeader>

      <p>{reason}</p>

      <AlertFooter>
        <AlertCancel>OK</AlertCancel>
      </AlertFooter>
    </Alert>
  )
}
