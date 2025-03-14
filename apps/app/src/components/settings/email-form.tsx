'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
	email: z.string().email(),
})

export const EmailForm = () => {
	const trpcUtils = trpc.useUtils()
	const [me] = trpc.users.me.useSuspenseQuery()
	const updateUserMutation = trpc.users.update.useMutation({
		onSuccess: () => {
			toast.success('Email updated')
			trpcUtils.users.me.invalidate()
		},
	})

	const form = useZodForm(formSchema, {
		defaultValues: {
			email: me.email,
		},
	})

	const handleSubmit = form.handleSubmit(async (data) => {
		updateUserMutation.mutate({
			email: data.email,
		})
	})

	return (
		<form className="border p-6" onSubmit={handleSubmit}>
			<label htmlFor="email">Email</label>
			<p className="text-muted-foreground mt-2">
				The email address associated with your account.
			</p>

			<div className="flex items-center gap-4 mt-4">
				<Input
					id="email"
					type="email"
					{...form.register('email')}
					placeholder="John Doe"
				/>
				<Button type="submit" disabled={updateUserMutation.isPending}>
					{updateUserMutation.isPending ? 'Saving...' : 'Save'}
				</Button>
			</div>
		</form>
	)
}
