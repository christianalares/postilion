import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Icon } from './ui/icon'

import { useSuspenseQuery } from '@tanstack/react-query'

type Props = {
  member: RouterOutputs['teams']['getBySlug']['members'][number]
}

export const TeamMemberDropdown = ({ member }: Props) => {
  const trpc = useTRPC()
  const { data: me } = useSuspenseQuery(trpc.users.me.queryOptions())

  const nameLabel = member.user.id === me.id ? 'You' : member.user.name

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="dotsVertical" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{nameLabel}</DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onSelect={() => {}}>
          Leave team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
