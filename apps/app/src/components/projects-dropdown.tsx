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
import { useTRPC } from '@/trpc/client'
import Link from 'next/link'
import { pushModal } from './modals'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'

import { useSuspenseQuery } from '@tanstack/react-query'

export const ProjectsDropdown = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const { data: projects } = useSuspenseQuery(trpc.projects.getForTeam.queryOptions({ slug: teamSlug }))
  const { data: project } = useSuspenseQuery(trpc.projects.getBySlug.queryOptions({ teamSlug, projectSlug }))

  const { data: team } = useSuspenseQuery(trpc.teams.getBySlug.queryOptions({ slug: teamSlug }))

  return (
    <div className="flex items-center gap-1">
      <Link href={`/${team.slug}/${project.slug}`} className="text-sm font-medium hover:underline underline-offset-4">
        {project.name}
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icon name="chevronDown" className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Your projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {projects.map((project) => {
            const isActive = project.slug === projectSlug

            return (
              <DropdownMenuItem key={project.id} asChild>
                <Link href={`/${team.slug}/${project.slug}`} className="flex items-center justify-between gap-2">
                  {project.name}
                  {isActive && <Icon name="check" className="size-4" />}
                </Link>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => pushModal('createProjectModal')}>
            <Icon name="plus" />
            <span>Create new project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const TeamsDropdownSkeleton = () => {
  return <Skeleton className="w-36 h-8" />
}
