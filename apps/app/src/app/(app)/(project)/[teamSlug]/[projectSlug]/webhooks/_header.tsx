'use client'

import { pushModal } from '@/components/modals'
import { PageHeader } from '@/components/page-header'

export const WebhooksHeader = () => {
  return (
    <PageHeader
      heading="Webhooks"
      cta={{
        label: 'Create webhook',
        onClick: () => pushModal('createWebhookModal'),
        icon: 'plus',
      }}
    />
  )
}
