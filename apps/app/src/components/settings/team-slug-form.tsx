'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormCard, FormCardSkeleton } from '../form-card'

const formSchema = z.object({
  teamSlug: z.string(),
})

export const TeamSlugForm = () => {
  const router = useRouter()
  const teamSlug = useTeamSlug()

  const [team] = trpc.teams.getBySlug.useSuspenseQuery({ slug: teamSlug })

  const updateTeamMutation = trpc.teams.update.useMutation({
    onSuccess: (craetedTeam) => {
      toast.success('Team slug updated')
      router.push(`/${craetedTeam.slug}/settings/team`)
    },
    onError: (error) => {
      toast.error(error.message)
      form.reset()
    },
  })

  const form = useZodForm(formSchema, {
    defaultValues: {
      teamSlug: team.slug,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    updateTeamMutation.mutate({
      slug: teamSlug,
      data: {
        slug: data.teamSlug,
      },
    })
  })

  return (
    <FormCard handleSubmit={handleSubmit} label="Team slug" labelId="team-slug" description="The slug of your team.">
      <Input id="team-slug" placeholder="John Doe" {...form.register('teamSlug')} />
    </FormCard>
    // <form className="border p-6" onSubmit={handleSubmit}>
    //   <label htmlFor="team-slug">Team slug</label>
    //   <p className="text-muted-foreground mt-2">The slug of your team.</p>

    //   <div className="flex items-center gap-4 mt-4">
    //     <Input id="team-slug" placeholder="John Doe" {...form.register('teamSlug')} />
    //     <Button type="submit" disabled={updateTeamMutation.isPending}>
    //       {updateTeamMutation.isPending ? 'Saving...' : 'Save'}
    //     </Button>
    //   </div>
    // </form>
  )
}

export const TeamSlugFormSkeleton = () => {
  return (
    <FormCardSkeleton label="Team slug" labelId="team-slug" description="The slug of your team." />
    // <div className="border p-6">
    //   <label htmlFor="team-slug">Team slug</label>
    //   <p className="text-muted-foreground mt-2">The slug of your team.</p>

    //   <div className="flex items-center gap-4 mt-4">
    //     <Input disabled placeholder="Loading..." id="team-slug" className="animate-pulse" />
    //     <Button type="button" disabled className="cursor-not-allowed">
    //       Save
    //     </Button>
    //   </div>
    // </div>
  )
}
