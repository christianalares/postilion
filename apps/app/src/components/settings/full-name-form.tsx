'use client'

import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormCard, FormCardSkeleton } from '../form-card'

const formSchema = z.object({
  fullName: z.string(),
})

export const FullNameForm = () => {
  const trpcUtils = trpc.useUtils()

  const [me] = trpc.users.me.useSuspenseQuery()

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success('Full name updated')
      trpcUtils.users.me.invalidate()
    },
  })

  const form = useZodForm(formSchema, {
    defaultValues: {
      fullName: me.name,
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    updateUserMutation.mutate({
      name: data.fullName,
    })
  })

  return (
    <FormCard
      handleSubmit={handleSubmit}
      label="Full name"
      labelId="full-name"
      description="Your full name as it will appear across the platform."
    >
      <Input id="full-name" {...form.register('fullName')} placeholder="John Doe" />
    </FormCard>
  )
}

export const FullNameFormSkeleton = () => {
  return (
    <FormCardSkeleton
      label="Full name"
      labelId="full-name"
      description="Your full name as it will appear across the platform."
    />
  )
}
