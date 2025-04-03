import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Icon } from './ui/icon'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

type Props = {
  invite: RouterOutputs['invites']['getForTeam'][number]
}

export const InvitedMemberDropdown = ({ invite }: Props) => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()
  const queryClient = useQueryClient()

  const cancelInviteMutation = useMutation(
    trpc.invites.cancel.mutationOptions({
      onSuccess: (deletedInvite) => {
        queryClient.invalidateQueries(trpc.invites.getForTeam.queryFilter({ teamSlug }))

        toast.success('Invite cancelled', {
          description: `Invite to ${deletedInvite.email} cancelled`,
        })
      },
      onError: (error) => {
        toast.error('Failed to cancel invite', {
          description: error.message,
        })
      },
    }),
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" loading={cancelInviteMutation.isPending}>
          <Icon name="dotsVertical" className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            cancelInviteMutation.mutate({
              inviteId: invite.id,
            })
          }}
        >
          Cancel invite
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
