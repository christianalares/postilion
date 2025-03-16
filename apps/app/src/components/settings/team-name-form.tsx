'use client'

import { Input } from '@/components/ui/input'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormCard, FormCardSkeleton } from '../form-card'

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
    },
    onError: (error) => {
      toast.error(error.message)
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
    <FormCard
      handleSubmit={handleSubmit}
      label="Team name"
      labelId="team-name"
      description="The name of your team."
      loading={updateTeamMutation.isPending}
    >
      <Input id="team-name" {...form.register('teamName')} placeholder="John Doe" />
    </FormCard>
  )
}

export const TeamNameFormSkeleton = () => {
  return <FormCardSkeleton label="Team name" labelId="team-name" description="The name of your team." />
}
