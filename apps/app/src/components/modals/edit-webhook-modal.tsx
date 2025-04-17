import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import type { RouterOutputs } from '@/trpc/routers/_app'
import { toast } from 'sonner'
import { popModal } from '.'
import { WebhookForm } from '../forms/webhook-form'
import { Modal, ModalDescription, ModalHeader, ModalTitle } from '../ui/modal'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

type Props = {
  webhook: RouterOutputs['webhooks']['getForProject'][number]
}

export const EditWebhookModal = ({ webhook }: Props) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const updateWebhookMutation = useMutation(
    trpc.webhooks.update.mutationOptions({
      onSuccess: () => {
        toast.success('Webhook updated')
        popModal('editWebhookModal')
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
        <ModalTitle>Edit webhook</ModalTitle>
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
            updateWebhookMutation.mutate({
              teamSlug,
              id: webhook.id,
              data: {
                url: values.url.trim(),
                method: values.method,
                secret: values.secret,
              },
            })
          }}
          isLoading={updateWebhookMutation.isPending}
          defaultValues={{
            method: webhook.method,
            url: webhook.url,
            secret: webhook.secret,
          }}
          ctaText="Save"
        />

        {/* <form className="flex flex-col mt-8" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span>URL</span>

            <div className="flex items-center gap-2">
              <Input placeholder="https://example.com/webhook/{handle}?subject={subject}" {...form.register('url')} />

              <Controller
                control={form.control}
                name="method"
                render={({ field }) => {
                  return (
                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Request method" />
                      </SelectTrigger>

                      <SelectContent>
                        {REQUEST_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                }}
              />
            </div>
          </label>

          <ErrorMessage message={form.formState.errors.url?.message} />

          {(form.watch('method') === 'DELETE' || form.watch('method') === 'GET') && (
            <p className="text-sm mt-2 flex items-center gap-2 bg-warning/10 border border-warning/20 p-2">
              <Icon name="circleAlert" className="size-4 text-warning" />
              When using GET or DELETE, the request will not include the body.
            </p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => popModal('createWebhookModal')}
              disabled={createWebhookMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createWebhookMutation.isPending}>
              Create
            </Button>
          </div>
        </form> */}
      </div>
    </Modal>
  )
}
