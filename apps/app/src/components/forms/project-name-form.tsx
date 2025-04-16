'use client'
import { Input } from '@/components/ui/input'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { useTRPC } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  projectName: z.string(),
})

export const ProjectNameForm = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const queryClient = useQueryClient()

  const { data: project } = useSuspenseQuery(trpc.projects.getBySlug.queryOptions({ teamSlug, projectSlug }))

  const updateProjectMutation = useMutation(
    trpc.projects.update.mutationOptions({
      onSuccess: () => {
        toast.success('Project name updated')
        queryClient.invalidateQueries(trpc.projects.getBySlug.queryFilter({ teamSlug, projectSlug }))
        queryClient.invalidateQueries(trpc.projects.getForTeam.queryFilter({ teamSlug }))
      },
      onError: (error) => {
        toast.error('Error updating project name', {
          description: error.message,
        })
      },
    }),
  )

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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            <label htmlFor="project-name">Project name</label>
          </CardTitle>
          <CardDescription>The name of your project.</CardDescription>
        </CardHeader>

        <CardContent className="flex gap-4">
          <Input id="project-name" {...form.register('projectName')} placeholder="John Doe" />
          <Button type="submit" loading={updateProjectMutation.isPending}>
            Save
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export const ProjectNameFormSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project name</CardTitle>
        <CardDescription>The name of your project.</CardDescription>
      </CardHeader>

      <CardContent className="flex gap-4">
        <Input id="project-name" placeholder="Loading..." />
        <Button type="button" disabled>
          Save
        </Button>
      </CardContent>
    </Card>
  )
}
