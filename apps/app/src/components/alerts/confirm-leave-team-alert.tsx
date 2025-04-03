'use client'

import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertTitle } from '@/components/ui/alert'
import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { popAlert } from '.'
import { Button } from '../ui/button'
import { DialogHeader } from '../ui/dialog'

type Props = {
  team: RouterOutputs['teams']['getBySlug']
}

export const ConfirmLeaveTeamAlert = ({ team }: Props) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const leaveTeamMutation = useMutation(
    trpc.teams.leave.mutationOptions({
      onSuccess: () => {
        router.push('/')
        popAlert('confirmLeaveTeam')
        queryClient.invalidateQueries(trpc.teams.getBySlug.queryFilter())

        toast.success('You left the team', {
          description: `You left the team ${team.name}`,
        })
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )

  return (
    <Alert>
      <DialogHeader>
        <AlertTitle>Delete project</AlertTitle>
        <AlertDescription>By leaving this team you will no longer have access to it or its projects.</AlertDescription>
      </DialogHeader>

      <p>Are you sure you want to continue?</p>

      <AlertFooter>
        <AlertCancel disabled={leaveTeamMutation.isPending}>Cancel</AlertCancel>
        <Button
          loading={leaveTeamMutation.isPending}
          variant="destructive"
          onClick={() => leaveTeamMutation.mutate({ teamSlug: team.slug })}
        >
          Leave team
        </Button>
      </AlertFooter>
    </Alert>
  )
}
