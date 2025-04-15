'use client'
import { Modal, ModalDescription, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useZodForm } from '@/hooks/use-zod-form'
import { useTRPC } from '@/trpc/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { popModal } from '.'
import { Button } from '../ui/button'
import { ErrorMessage } from '../ui/error-message'
import { Input } from '../ui/input'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

const formSchema = z.object({
  domain: z
    .string()
    .min(3, { message: 'Domain must be at least 3 characters long' })
    .regex(/^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, {
      message: 'Please enter a valid domain name',
    }),
})

export const AddDomainModal = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const form = useZodForm(formSchema)
  const router = useRouter()
  const teamSlug = useTeamSlug()

  const createDomainMutation = useMutation(
    trpc.domains.create.mutationOptions({
      onSuccess: (createdDomain) => {
        queryClient.invalidateQueries(trpc.domains.getForTeam.queryFilter({ teamSlug }))
        popModal('addDomainModal')
        toast.success('Domain created successfully')
        router.push(`/${teamSlug}/domains/${createdDomain.domain}`)
      },
      onError: (error) => {
        toast.error('Failed to create domain', {
          description: error.message,
        })
      },
    }),
  )

  const handleSubmit = form.handleSubmit((values) => {
    createDomainMutation.mutate({
      domain: values.domain,
      teamSlug,
    })
  })

  return (
    <Modal>
      <ModalHeader>
        <ModalTitle>Add Domain</ModalTitle>
        <ModalDescription>Add a new domain to your team</ModalDescription>
      </ModalHeader>

      <form className="flex flex-col" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span>Domain name</span>
          <Input placeholder="Enter a domain (e.g., example.com)" {...form.register('domain')} />
        </label>

        <ErrorMessage message={form.formState.errors.domain?.message} />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => popModal('addDomainModal')}
            disabled={createDomainMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={createDomainMutation.isPending}>
            Add Domain
          </Button>
        </div>
      </form>
    </Modal>
  )
}
