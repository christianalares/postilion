'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import { FormCard, FormCardSkeleton } from '../form-card'
import { Input } from '../ui/input'

export const DeleteTeamForm = () => {
  const teamSlug = useTeamSlug()
  const [team] = trpc.teams.getBySlug.useSuspenseQuery({ slug: teamSlug })

  return (
    <FormCard
      handleSubmit={() => {}}
      label="Delete team"
      labelId="delete-team"
      description="Permanently delete your team and all associated data."
      variant="destructive"
      ctaText="Delete team"
      // loading={deleteTeamMutation.isPending}
    >
      <Input id="full-name" /* {...form.register('fullName')} */ placeholder={`Enter "${team.name}" to confirm`} />
    </FormCard>
  )
}

export const DeleteTeamFormSkeleton = () => {
  return (
    <FormCardSkeleton
      label="Delete team"
      labelId="delete-team"
      description="Permanently delete your team and all associated data."
    />
  )
}
