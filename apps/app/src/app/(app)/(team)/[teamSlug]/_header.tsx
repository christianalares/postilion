'use client'

import { pushModal } from '@/components/modals'
import { PageHeader } from '@/components/page-header'

export const ProjectsHeader = () => {
  return (
    <PageHeader
      heading="Projects"
      cta={{
        icon: 'plus',
        label: 'Create new',
        onClick: () => pushModal('createProjectModal'),
      }}
    />
  )
}
