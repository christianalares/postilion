'use client'
import { Input } from '@/components/ui/input'
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
  teamName: z.string(),
})

export const TeamNameForm = () => {
  const trpc = useTRPC()
  const teamSlug = useTeamSlug()
  const queryClient = useQueryClient()

  const { data: team } = useSuspenseQuery(trpc.teams.getBySlug.queryOptions({ slug: teamSlug }))

  const updateTeamMutation = useMutation(
    trpc.teams.update.mutationOptions({
      onSuccess: () => {
        toast.success('Team name updated')
        queryClient.invalidateQueries(trpc.teams.getBySlug.pathFilter())
        queryClient.invalidateQueries(trpc.teams.getForUser.pathFilter())
      },
      onError: (error) => {
        toast.error(error.message)
        form.reset()
      },
    }),
  )

  const form = useZodForm(formSchema, {
    defaultValues: {
      teamName: team.name,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    updateTeamMutation.mutate({
      slug: teamSlug,
      data: {
        name: data.teamName,
      },
    })
  })

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            <label htmlFor="team-name">Team name</label>
          </CardTitle>
          <CardDescription>The name of your team.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input id="team-name" {...form.register('teamName')} placeholder="Acme Inc." />
          <Button type="submit" loading={updateTeamMutation.isPending}>
            Save
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export const TeamNameFormSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team name</CardTitle>
        <CardDescription>The name of your team.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Input id="team-name" placeholder="Acme Inc.!!!!!!" />
        <Button type="button" disabled>
          Save
        </Button>
      </CardContent>
    </Card>
  )
}
