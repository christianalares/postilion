'use client'

import { Modal, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { trpc } from '@/trpc/client'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { popModal } from '.'
import { Button } from '../ui/button'
import { ErrorMessage } from '../ui/error-message'
import { Input } from '../ui/input'

const formSchema = z.object({
  teamName: z.string().min(3, { message: 'Team name must be at least 3 characters long' }),
})

export const CreateTeamModal = () => {
  const form = useZodForm(formSchema)
  const router = useRouter()
  const teamSlug = useTeamSlug()
  const pathname = usePathname()

  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: (createdTeam) => {
      const newPath = pathname
        .split('/')
        .map((segment) => (segment === teamSlug ? createdTeam.slug : segment))
        .join('/')

      popModal('createTeamModal')
      toast.success('Team created successfully')

      router.push(newPath)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    createTeamMutation.mutate({
      name: data.teamName,
    })
  })

  return (
    <Modal>
      <ModalHeader>
        <ModalTitle>Create team</ModalTitle>
        <ModalDescription>Create a new team</ModalDescription>
      </ModalHeader>

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span>Team name</span>
          <Input placeholder="Enter a team name" {...form.register('teamName')} />
        </label>

        <ErrorMessage message={form.formState.errors.teamName?.message} />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => popModal('createTeamModal')}
            disabled={createTeamMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createTeamMutation.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
