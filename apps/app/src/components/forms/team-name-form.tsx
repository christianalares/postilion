'use client'

import { Input } from '@/components/ui/input'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

const formSchema = z.object({
  teamName: z.string(),
})

export const TeamNameForm = () => {
  const teamSlug = useTeamSlug()
  const trpcUtils = trpc.useUtils()

  const [team] = trpc.teams.getBySlug.useSuspenseQuery({ slug: teamSlug })

  const updateTeamMutation = trpc.teams.update.useMutation({
    onSuccess: () => {
      toast.success('Team name updated')
      trpcUtils.teams.getBySlug.invalidate()
      trpcUtils.teams.getForUser.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
      form.reset()
    },
  })

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
