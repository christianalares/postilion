'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useSelectedLayoutSegment } from 'next/navigation'
import { Menu } from './menu-items'

export const ProjectMenu = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const segment = useSelectedLayoutSegment()

  return (
    <Menu
      items={[
        {
          isActive: segment === null,
          href: `/${teamSlug}/${projectSlug}`,
          icon: 'dashboard',
          label: 'Dashboard',
        },
        {
          isActive: segment === 'messages',
          href: `/${teamSlug}/${projectSlug}/messages`,
          icon: 'message',
          label: 'Messages',
        },
        {
          isActive: segment === 'webhooks',
          href: `/${teamSlug}/${projectSlug}/webhooks`,
          icon: 'webhook',
          label: 'Webhooks',
        },
        {
          isActive: segment === 'settings',
          href: `/${teamSlug}/${projectSlug}/settings`,
          icon: 'settings',
          label: 'Settings',
        },
      ]}
    />
  )
}
