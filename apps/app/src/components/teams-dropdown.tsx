'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { pushModal } from './modals'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'

export const TeamsDropdown = () => {
  const teamSlug = useTeamSlug()
  const pathname = usePathname()
  const projectSlug = useProjectSlug()

  const trpcUtils = trpc.useUtils()

  const [team] = trpc.teams.getBySlug.useSuspenseQuery({ slug: teamSlug })
  const [teams] = trpc.teams.getForUser.useSuspenseQuery()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          {team.name}
          <Icon name="chevronDown" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Your teams</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teams.map((team) => {
          const isActive = team.slug === teamSlug

          const href = pathname
            .split('/')
            .map((segment) => {
              // (segment === teamSlug ? team.slug : segment)
              if (segment === teamSlug) {
                return team.slug
              }

              if (segment === projectSlug) {
                return 'default'
              }

              return segment
            })
            .join('/')

          return (
            <DropdownMenuItem key={team.id} asChild>
              <Link
                href={href}
                className="flex items-center justify-between gap-2"
                onClick={() => {
                  trpcUtils.teams.getBySlug.invalidate({ slug: team.slug })
                }}
              >
                {team.name}
                {isActive && <Icon name="check" className="size-4" />}
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => pushModal('createTeamModal')}>
          <Icon name="plus" />
          <span>Create new team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const TeamsDropdownSkeleton = () => {
  return <Skeleton className="w-36 h-8" />
}
