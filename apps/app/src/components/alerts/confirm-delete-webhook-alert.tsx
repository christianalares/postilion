'use client'

import { Alert, AlertCancel, AlertDescription, AlertFooter, AlertTitle } from '@/components/ui/alert'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { popAlert } from '.'
import { Button } from '../ui/button'
import { DialogHeader } from '../ui/dialog'

type Props = {
  webhookId: string
}

export const ConfirmDeleteWebhookAlert = ({ webhookId }: Props) => {
  const trpcUtils = trpc.useUtils()
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()

  const deleteWebhookMutation = trpc.webhooks.delete.useMutation({
    onSuccess: () => {
      trpcUtils.webhooks.getForProject.invalidate({ teamSlug, projectSlug })
      toast.success('Webhook deleted')
      popAlert('confirmDeleteWebhook')
    },
  })

  return (
    <Alert>
      <DialogHeader>
        <AlertTitle>Delete webhook</AlertTitle>
        <AlertDescription>This webhook will no longer be used to send requests to.</AlertDescription>
      </DialogHeader>

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
