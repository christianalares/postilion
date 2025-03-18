import { ProjectsList, ProjectsListSkeleton } from '@/components/projects-list'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

type Params = Promise<{
  teamSlug: string
}>

const TeamPage = async ({ params }: { params: Params }) => {
  const { teamSlug } = await params

  trpc.projects.getForTeam.prefetch({ slug: teamSlug })

  return (
    <HydrateClient>
      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsList />
      </Suspense>
    </HydrateClient>
  )
}

export default TeamPage
