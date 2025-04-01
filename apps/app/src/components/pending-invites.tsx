'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { teamRoleEnumToLabel } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { InvitedMemberDropdown } from './invited-member-dropdown'
import { Avatar } from './ui/avatar'

export const PendingInvites = () => {
  const teamSlug = useTeamSlug()
  const [invites] = trpc.invites.getForTeam.useSuspenseQuery({ teamSlug })

  if (invites.length === 0) {
    return (
      <div className="border-dashed border p-6">
        <p className="text-sm text-muted-foreground font-mono">There are no current invites for this team</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {invites.map((invite) => {
        return (
          <li key={invite.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={invite.email} className="size-10" />

              <div>
                <p className="text-xs font-medium font-mono">{invite.email}</p>
                <p className="text-xs text-muted-foreground">Invited by {invite.created_by.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{teamRoleEnumToLabel(invite.role)}</span>
              <InvitedMemberDropdown invite={invite} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
