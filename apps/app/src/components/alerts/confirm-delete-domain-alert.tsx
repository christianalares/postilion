'use client'
import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertHeader, AlertTitle } from '@/components/ui/alert'
import { Button } from '../ui/button'

import { useQueryClient } from '@tanstack/react-query'

type Props = {
  domainId: string
}

export const ConfirmDeleteDomainAlert = ({ domainId: _domainId }: Props) => {
  const _queryClient = useQueryClient()

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
      <AlertHeader>
        <AlertTitle>Delete domain</AlertTitle>
        <AlertDescription>
          By deleting this domain you will no longer have access to it. All projects that use this domain will no longer
          work.
        </AlertDescription>
      </AlertHeader>

      <p>Are you sure you want to continue?</p>

      <AlertFooter>
        <AlertCancel /* disabled={leaveTeamMutation.isPending} */>Cancel</AlertCancel>
        <Button
          // loading={leaveTeamMutation.isPending}
          variant="destructive"
          // onClick={() => leaveTeamMutation.mutate({ teamId })}
        >
          Delete domain
        </Button>
      </AlertFooter>
    </Alert>
  )
}
