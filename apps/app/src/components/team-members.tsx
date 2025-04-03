'use client'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { teamRoleEnumToLabel } from '@/lib/utils'
import { useTRPC } from '@/trpc/client'
import { TeamMemberDropdown } from './team-member-dropdown'
import { Avatar } from './ui/avatar'

import { useSuspenseQuery } from '@tanstack/react-query'
import { RoleSelect } from './role-select'

export const TeamMembers = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()

  const { data: team } = useSuspenseQuery(trpc.teams.getBySlug.queryOptions({ slug: teamSlug }))
  const { data: me } = useSuspenseQuery(trpc.users.me.queryOptions())

  const youAreOwner = team.members.some((member) => member.user.id === me.id && member.role === 'OWNER')

  return (
    <ul className="flex flex-col gap-4">
      {team.members.map((member) => {
        const isYou = member.user.id === me.id

        return (
          <li key={member.user_id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={member.user.name} imageUrl={member.user.image} className="size-10" />

              <div>
                <p className="text-xs font-medium font-mono flex items-center gap-2">
                  {member.user.name}
                  {isYou && <span className="text-xs font-mono text-muted-foreground italic">- You</span>}
                </p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {youAreOwner ? (
                <RoleSelect member={member} team={team} />
              ) : (
                <span className="text-xs font-mono text-muted-foreground">{teamRoleEnumToLabel(member.role)}</span>
              )}
              {<TeamMemberDropdown team={team} member={member} youAreOwner={youAreOwner} />}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
