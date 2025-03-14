'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'

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
		<form className="border p-6" onSubmit={handleSubmit}>
			<label htmlFor="team-name">Team name</label>
			<p className="text-muted-foreground mt-2">The name of your team.</p>

			<div className="flex items-center gap-4 mt-4">
				<Input
					id="team-name"
					{...form.register('teamName')}
					placeholder="John Doe"
				/>
				<Button type="submit" disabled={updateTeamMutation.isPending}>
					{updateTeamMutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</form>
	)
}
