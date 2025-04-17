import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { toast } from 'sonner'
import { popModal } from '.'
import { WebhookForm } from '../forms/webhook-form'
import { Modal, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

export const CreateWebhookModal = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const createWebhookMutation = useMutation(
    trpc.webhooks.create.mutationOptions({
      onSuccess: () => {
        toast.success('Webhook created')
        popModal('createWebhookModal')
        queryClient.invalidateQueries(trpc.webhooks.getForProject.queryFilter({ teamSlug, projectSlug }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )

  return (
    <Modal className="!max-w-2xl">
      <ModalHeader>
        <ModalTitle>Create webhook</ModalTitle>
        <ModalDescription>When new messages come in, we'll send a request to this URL.</ModalDescription>
      </ModalHeader>

      <div>
        <div>
          <p>The following placeholders are available to use:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>
              <span className="font-mono text-xs inline-block py-px px-0.5 bg-muted rounded">{'{handle}'}</span> -{' '}
              <span className="font-mono text-xs inline-block py-px px-0.5 bg-muted rounded">xyz123</span>
              @your-domain.com
            </li>
            <li>
              <span className="font-mono text-xs inline-block py-px px-0.5 bg-muted rounded">{'{subject}'}</span> - The
              subject of the message
            </li>
          </ul>
        </div>

        <WebhookForm
          onSubmit={(values) => {
            createWebhookMutation.mutate({
              teamSlug,
              projectSlug,
              url: values.url.trim(),
              method: values.method,
              secret: values.secret,
            })
          }}
          isLoading={createWebhookMutation.isPending}
          defaultValues={{
            method: 'POST',
          }}
          ctaText="Create"
        />
      </div>
    </Modal>
  )
}
