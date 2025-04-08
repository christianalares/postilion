'use client'

import { pushModal } from '@/components/modals'
import { PageHeader } from '@/components/page-header'

export const DomainHeader = () => {
  return (
    <PageHeader
      heading="Domains"
      cta={{
        icon: 'plus',
        label: 'Add Domain',
        onClick: () => pushModal('addDomainModal'),
      }}
    />
  )
}
