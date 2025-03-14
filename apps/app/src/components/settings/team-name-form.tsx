'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { z } from 'zod'

const formSchema = z.object({
	teamName: z.string(),
})

export const TeamNameForm = () => {
	const trpcUtils = trpc.useUtils()
	const [me] = trpc.users.me.useSuspenseQuery()
	const updateTeamNameMutation = trpc.organizations.updateName.useMutation({
		onSuccess: () => {
			trpcUtils.users.me.invalidate()
		},
	})

	const form = useZodForm(formSchema, {
		defaultValues: {
			teamName: 'me.email',
		},
	})

	const handleSubmit = form.handleSubmit(async (data) => {
		updateTeamNameMutation.mutate({
			teamId: '',
			teamName: data.teamName,
		})
	})

	return (
		<form className="border p-6" onSubmit={handleSubmit}>
			<label htmlFor="team-name">Team name</label>
			<p className="text-muted-foreground mt-2">The name of your team.</p>

			<div className="flex items-center gap-4 mt-4">
				<Input {...form.register('teamName')} placeholder="John Doe" />
				<Button type="submit" disabled={updateTeamNameMutation.isPending}>
					{updateTeamNameMutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</form>
	)
}
