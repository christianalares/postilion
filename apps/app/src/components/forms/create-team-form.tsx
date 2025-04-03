'use client'

import { useZodForm } from '@/hooks/use-zod-form'
import { cn } from '@/lib/utils'
import type { DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { popModal } from '../modals'
import { Button } from '../ui/button'
import { ErrorMessage } from '../ui/error-message'
import { Input } from '../ui/input'

const formSchema = z.object({
  teamName: z.string().min(3, { message: 'Team name must be at least 3 characters long' }),
})

type Props = {
  className?: string
  hideCancelButton?: boolean
  onSubmit: (values: z.infer<typeof formSchema>) => void
  isLoading?: boolean
  defaultValues?: DefaultValues<z.infer<typeof formSchema>>
}

export const CreateTeamForm = ({ className, onSubmit, isLoading, defaultValues, hideCancelButton }: Props) => {
  const form = useZodForm(formSchema, { defaultValues })

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values)
  })

  return (
    <form className={cn('flex flex-col', className)} onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2">
        <span>Team name</span>
        <Input placeholder="Enter a team name" {...form.register('teamName')} />
      </label>

      <ErrorMessage message={form.formState.errors.teamName?.message} />

      <div className="flex justify-end gap-2 mt-4">
        {!hideCancelButton && (
          <Button variant="outline" type="button" onClick={() => popModal('createTeamModal')} disabled={isLoading}>
            Cancel
          </Button>
        )}

        <Button type="submit" loading={isLoading}>
          Create team
        </Button>
      </div>
    </form>
  )
}
