import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Icon } from './ui/icon'

type Props = {
  invite: RouterOutputs['invites']['getForTeam'][number]
}

export const InvitedMemberDropdown = ({ invite }: Props) => {
  const teamSlug = useTeamSlug()
  const trpcUtils = trpc.useUtils()

  const cancelInviteMutation = trpc.invites.cancel.useMutation({
    onSuccess: (deletedInvite) => {
      trpcUtils.invites.getForTeam.invalidate({ teamSlug })

      toast.success('Invite cancelled', {
        description: `Invite to ${deletedInvite.email} cancelled`,
      })
    },
    onError: (error) => {
      toast.error('Failed to cancel invite', {
        description: error.message,
      })
    },
  })

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
