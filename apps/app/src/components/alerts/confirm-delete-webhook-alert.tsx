'use client'
import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertHeader, AlertTitle } from '@/components/ui/alert'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useTRPC } from '@/trpc/client'
import { toast } from 'sonner'
import { popAlert } from '.'
import { Button } from '../ui/button'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

type Props = {
  webhookId: string
}

export const ConfirmDeleteWebhookAlert = ({ webhookId }: Props) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const deleteWebhookMutation = useMutation(
    trpc.webhooks.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.webhooks.getForProject.queryFilter({ teamSlug, projectSlug }))
        toast.success('Webhook deleted')
        popAlert('confirmDeleteWebhook')
      },
    }),
  )

  return (
    <Alert>
      <AlertHeader>
        <AlertTitle>Delete webhook</AlertTitle>
        <AlertDescription>This webhook will no longer be used to send requests to.</AlertDescription>
      </AlertHeader>

      <p>Are you sure you want to continue?</p>

      <AlertFooter>
        <AlertCancel disabled={deleteWebhookMutation.isPending}>Cancel</AlertCancel>
        <Button
          loading={deleteWebhookMutation.isPending}
          variant="destructive"
          onClick={() => deleteWebhookMutation.mutate({ id: webhookId })}
        >
          Delete
        </Button>
      </AlertFooter>
    </Alert>
  )
}
