import { ProjectsList, ProjectsListSkeleton } from '@/components/projects-list'
import { HydrateClient, prefetch, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { ProjectsHeader } from './_header'

export const dynamic = 'force-dynamic'

type Params = Promise<{
  teamSlug: string
}>

const TeamPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  prefetch(trpc.projects.getForTeam.queryOptions({ teamSlug }))

  return (
    <HydrateClient>
      <ProjectsHeader />

      <div className="p-4">
        <Suspense fallback={<ProjectsListSkeleton />}>
          <ProjectsList />
        </Suspense>
      </div>
    </HydrateClient>
  )
}

export default TeamPage
