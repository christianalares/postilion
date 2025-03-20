'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { Icon } from './ui/icon'
import { Skeleton } from './ui/skeleton'

export const ProjectsList = () => {
  const teamsSlug = useTeamSlug()
  const [projects] = trpc.projects.getForTeam.useSuspenseQuery({ slug: teamsSlug })

  return (
    <ul className="flex flex-wrap gap-4">
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            className="px-8 h-28 flex flex-col justify-center border hover:border-accent-foreground/30"
            href={`/${teamsSlug}/${project.slug}`}
          >
            <span className="font-mono">{project.name}</span>

            <div className="space-y-2 mt-4 text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <Icon name="calendar" className="size-4" />
                {new Date(project.created_at).toLocaleString()}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export const ProjectsListSkeleton = () => {
  return (
    <ul className="flex flex-wrap gap-4">
      {Array.from({ length: 2 }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
        <li key={index}>
          <div className="px-8 h-28 flex flex-col justify-center border">
            <Skeleton className="h-[19px] w-40" />

            <div className="space-y-2 mt-4 text-xs">
              <span className="text-muted-foreground flex items-center gap-2">
                <Icon name="calendar" className="size-4" />
                <Skeleton className="h-4 w-2/3" />
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
