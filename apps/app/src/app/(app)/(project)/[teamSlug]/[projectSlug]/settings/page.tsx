import { ConnectedDomainFormSkeleton } from '@/components/forms/connected-domain-form'
import { ConnectedDomainForm } from '@/components/forms/connected-domain-form'
import { DeleteProjectForm, DeleteProjectFormSkeleton } from '@/components/forms/delete-project-form'
import { ProjectNameForm, ProjectNameFormSkeleton } from '@/components/forms/project-name-form'
import { HydrateClient, trpc } from '@/trpc/server'
import { Suspense } from 'react'
import { ProjectSettingsHeader } from './_header'

type Params = Promise<{
  teamSlug: string
  projectSlug: string
}>

type Props = {
  params: Params
}

const ProjectSettingsPage = async ({ params }: Props) => {
  const { teamSlug, projectSlug } = await params

  trpc.projects.getBySlug.prefetch({ teamSlug, projectSlug })
  trpc.domains.getForTeam.prefetch({ teamSlug })

  return (
    <HydrateClient>
      <ProjectSettingsHeader />

      <div className="max-w-4xl space-y-8">
        <Suspense fallback={<ProjectNameFormSkeleton />}>
          <ProjectNameForm />
        </Suspense>

        <Suspense fallback={<ConnectedDomainFormSkeleton />}>
          <ConnectedDomainForm />
        </Suspense>

        {projectSlug !== 'default' && (
          <Suspense fallback={<DeleteProjectFormSkeleton />}>
            <DeleteProjectForm />
          </Suspense>
        )}
      </div>
    </HydrateClient>
  )
}

export default ProjectSettingsPage
