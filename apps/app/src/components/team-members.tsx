'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { teamRoleEnumToLabel } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { TeamMemberDropdown } from './team-member-dropdown'
import { Avatar } from './ui/avatar'

export const TeamMembers = () => {
  const teamSlug = useTeamSlug()
  const [team] = trpc.teams.getBySlug.useSuspenseQuery({ slug: teamSlug })

  return (
    <ul className="flex flex-col gap-4">
      {team.members.map((member) => {
        return (
          <li key={member.user_id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={member.user.name} imageUrl={member.user.image} className="size-10" />

              <div>
                <p className="text-xs font-medium font-mono">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{teamRoleEnumToLabel(member.role)}</span>
              <TeamMemberDropdown member={member} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
