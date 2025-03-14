'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { z } from 'zod'

const formSchema = z.object({
	fullName: z.string(),
})

export const FullNameForm = () => {
	const trpcUtils = trpc.useUtils()
	const [me] = trpc.users.me.useSuspenseQuery()
	const updateNameMutation = trpc.users.updateName.useMutation({
		onSuccess: () => {
			trpcUtils.users.me.invalidate()
		},
	})

	const form = useZodForm(formSchema, {
		defaultValues: {
			fullName: me.name,
		},
	})

	const handleSubmit = form.handleSubmit(async (data) => {
		updateNameMutation.mutate({
			name: data.fullName,
		})
	})

	return (
		<form className="border p-6" onSubmit={handleSubmit}>
			<label htmlFor="fullName">Full name</label>
			<p className="text-muted-foreground mt-2">
				Your full name as it will appear across the platform.
			</p>

			<div className="flex items-center gap-4 mt-4">
				<Input {...form.register('fullName')} placeholder="John Doe" />
				<Button type="submit" disabled={updateNameMutation.isPending}>
					{updateNameMutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</form>
	)
}
