import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Icon } from './ui/icon'

import { cn } from '@/lib/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { pushAlert } from './alerts'

type Props = {
  team: RouterOutputs['teams']['getBySlug']
  member: RouterOutputs['teams']['getBySlug']['members'][number]
  youAreOwner: boolean
}

export const TeamMemberDropdown = ({ team, member, youAreOwner }: Props) => {
  const trpc = useTRPC()
  const { data: me } = useSuspenseQuery(trpc.users.me.queryOptions())

  const isYou = member.user.id === me.id

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={!isYou && !youAreOwner}>
        <Button
          variant="ghost"
          size="icon"
          className={cn({
            'cursor-not-allowed': !isYou && !youAreOwner,
          })}
        >
          <Icon name="dotsVertical" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isYou ? (
          <DropdownMenuItem variant="destructive" onSelect={() => pushAlert('confirmLeaveTeam', { team })}>
            Leave team
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem variant="destructive" onSelect={() => {}}>
            Remove from team
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
