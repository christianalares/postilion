'use client'
import { Input } from '@/components/ui/input'
import { useZodForm } from '@/hooks/use-zod-form'
import { useTRPC } from '@/trpc/client'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  email: z.string().email(),
})

export const EmailForm = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: me } = useSuspenseQuery(trpc.users.me.queryOptions())
  const updateUserMutation = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: () => {
        toast.success('Email updated')
        queryClient.invalidateQueries(trpc.users.me.pathFilter())
      },
    }),
  )

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
