'use client'

import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            <label htmlFor="">Email</label>
          </CardTitle>
          <CardDescription>The email address associated with your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input id="email" type="email" {...form.register('email')} placeholder="john@doe.com" />
          <Button type="submit" loading={updateUserMutation.isPending}>
            Save
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export const EmailFormSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>The email address associated with your account.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Input id="email" type="email" placeholder="john@doe.com" />
        <Button type="button" disabled>
          Save
        </Button>
      </CardContent>
    </Card>
  )
}
