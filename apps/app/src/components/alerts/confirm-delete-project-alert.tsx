'use client'
import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertTitle } from '@/components/ui/alert'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useState } from 'react'
import { Button } from '../ui/button'
import { DialogHeader } from '../ui/dialog'
import { Input } from '../ui/input'

import { useQueryClient } from '@tanstack/react-query'

type Props = {
  project: RouterOutputs['projects']['getBySlug']
}

export const ConfirmDeleteProjectAlert = ({ project }: Props) => {
  const [confirmText, setConfirmText] = useState('')
  const _queryClient = useQueryClient()

  const isConfirmed = confirmText === project.name.toUpperCase()

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
        <AlertTitle>Delete project</AlertTitle>
        <AlertDescription>
          By deleting this project you will no longer have access to it. All data associated with this project will be
          permanently deleted.
        </AlertDescription>
      </DialogHeader>

      <p>Are you sure you want to continue?</p>

      <Input
        type="text"
        placeholder={`Type ${project.name.toUpperCase()} to confirm`}
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />

      <AlertFooter>
        <AlertCancel /* disabled={leaveTeamMutation.isPending} */>Cancel</AlertCancel>
        <Button
          disabled={!isConfirmed}
          // loading={leaveTeamMutation.isPending}
          variant="destructive"
          // onClick={() => leaveTeamMutation.mutate({ teamId })}
        >
          Delete project
        </Button>
      </AlertFooter>
    </Alert>
  )
}
