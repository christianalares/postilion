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
  fullName: z.string(),
})

export const FullNameForm = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: me } = useSuspenseQuery(trpc.users.me.queryOptions())

  const updateUserMutation = useMutation(
    trpc.users.update.mutationOptions({
      onSuccess: () => {
        toast.success('Full name updated')
        queryClient.invalidateQueries(trpc.users.me.pathFilter())
      },
    }),
  )

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
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            <label htmlFor="full-name">Full name</label>
          </CardTitle>

          <CardDescription>Your full name as it will appear across the platform.</CardDescription>
        </CardHeader>

        <CardContent className="flex gap-4">
          <Input id="full-name" {...form.register('fullName')} placeholder="John Doe" />
          <Button type="submit" loading={updateUserMutation.isPending}>
            Save
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export const FullNameFormSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Full name</CardTitle>
        <CardDescription>Your full name as it will appear across the platform.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Input id="full-name" placeholder="Loading..." />
        <Button type="button" disabled>
          Save
        </Button>
      </CardContent>
    </Card>
  )
}
