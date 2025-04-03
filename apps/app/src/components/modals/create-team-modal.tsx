'use client'
import { Modal, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { popModal } from '.'

import { useMutation } from '@tanstack/react-query'
import { CreateTeamForm } from '../forms/create-team-form'

export const CreateTeamModal = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const teamSlug = useTeamSlug()
  const pathname = usePathname()

  const createTeamMutation = useMutation(
    trpc.teams.create.mutationOptions({
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
    }),
  )

  return (
    <Modal>
      <ModalHeader>
        <ModalTitle>Create team</ModalTitle>
        <ModalDescription>Create a new team</ModalDescription>
      </ModalHeader>

      <CreateTeamForm
        onSubmit={(values) => {
          createTeamMutation.mutate({
            name: values.teamName,
          })
        }}
        isLoading={createTeamMutation.isPending}
      />
    </Modal>
  )
}
