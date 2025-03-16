'use client'

import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormCard, FormCardSkeleton } from '../form-card'

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
    <FormCard
      handleSubmit={handleSubmit}
      label="Email"
      labelId="email"
      description="The email address associated with your account."
      loading={updateUserMutation.isPending}
    >
      <Input id="email" type="email" {...form.register('email')} placeholder="John Doe" />
    </FormCard>
  )
}

export const EmailFormSkeleton = () => {
  return (
    <FormCardSkeleton label="Email" labelId="email" description="The email address associated with your account." />
  )
}
