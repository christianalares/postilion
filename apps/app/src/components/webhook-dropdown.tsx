import type { RouterOutputs } from '@/trpc/routers/_app'
import { pushAlert } from './alerts'
import { pushModal } from './modals'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Icon } from './ui/icon'

type Props = {
  webhook: RouterOutputs['webhooks']['getForProject'][number]
}

export const WebhookDropdown = ({ webhook }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon name="dotsVertical" className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => pushModal('editWebhookModal', { webhook })}>
          <Icon name="pencil" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => pushAlert('confirmDeleteWebhook', { webhookId: webhook.id })}
        >
          <Icon name="trash" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
