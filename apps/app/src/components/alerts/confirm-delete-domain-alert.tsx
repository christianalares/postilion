'use client'

import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertTitle } from '@/components/ui/alert'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { popAlert } from '.'
import { Button } from '../ui/button'
import { DialogHeader } from '../ui/dialog'

type Props = {
  domainId: string
}

export const ConfirmDeleteDomainAlert = ({ domainId }: Props) => {
  const trpcUtils = trpc.useUtils()

  // const leaveTeamMutation = trpc.teams.leave.useMutation({
  //   onSuccess: (leftTeam) => {
  //     trpcUtils.users.me.invalidate()
  //     trpcUtils.teams.invites.invalidate()
  //     trpcUtils.teams.findMany.invalidate()

  //     toast.success(`You have left the team ${leftTeam.team.name}`)
  //     popAlert('confirmLeaveTeam')
  //   },
  //   onError: (error) => {
  //     toast.error(error.message)
  //   },
  // })

  return (
    <Alert>
      <DialogHeader>
        <AlertTitle>Delete domain</AlertTitle>
        <AlertDescription>
          By deleting this domain you will no longer have access to it. All projects that use this domain will no longer
          work.
        </AlertDescription>
      </DialogHeader>

      <p>Are you sure you want to continue?</p>

      <AlertFooter>
        <AlertCancel /* disabled={leaveTeamMutation.isPending} */>Cancel</AlertCancel>
        <Button
          // loading={leaveTeamMutation.isPending}
          variant="destructive"
          // onClick={() => leaveTeamMutation.mutate({ teamId })}
        >
          Leave team
        </Button>
      </AlertFooter>
    </Alert>
  )
}
