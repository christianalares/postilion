'use client'

import { Input } from '@/components/ui/input'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormCard, FormCardSkeleton } from '../form-card'

const formSchema = z.object({
  projectName: z.string(),
})

export const ProjectNameForm = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const trpcUtils = trpc.useUtils()

  const [project] = trpc.projects.getBySlug.useSuspenseQuery({ teamSlug, projectSlug })

  const updateProjectMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success('Project name updated')
      trpcUtils.projects.getBySlug.invalidate({ teamSlug, projectSlug })
    },
    onError: (error) => {
      toast.error('Error updating project name', {
        description: error.message,
      })
    },
  })

  const form = useZodForm(formSchema, {
    defaultValues: {
      projectName: project.name,
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    updateProjectMutation.mutate({
      teamSlug,
      projectSlug,
      data: {
        name: values.projectName,
      },
    })
  })

  return (
    <FormCard
      handleSubmit={handleSubmit}
      label="Project name"
      labelId="project-name"
      description="The name of your project."
      loading={updateProjectMutation.isPending}
    >
      <Input id="project-name" {...form.register('projectName')} placeholder="John Doe" />
    </FormCard>
  )
}

export const ProjectNameFormSkeleton = () => {
  return <FormCardSkeleton label="Project name" labelId="project-name" description="The name of your project." />
}
