'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { usePathname } from 'next/navigation'
import { Menu } from './menu-items'

export const ProjectMenu = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const pathname = usePathname()

  return (
    <Menu
      items={[
        {
          isActive: pathname === `/${teamSlug}/${projectSlug}`,
          href: `/${teamSlug}/${projectSlug}`,
          icon: 'dashboard',
          label: 'Dashboard',
        },
        {
          isActive: pathname.startsWith(`/${teamSlug}/${projectSlug}/messages`),
          href: `/${teamSlug}/${projectSlug}/messages`,
          icon: 'message',
          label: 'Messages',
        },
        {
          isActive: pathname === `/${teamSlug}/${projectSlug}/webhooks`,
          href: `/${teamSlug}/${projectSlug}/webhooks`,
          icon: 'webhook',
          label: 'Webhooks',
        },
        {
          isActive: pathname === `/${teamSlug}/${projectSlug}/settings`,
          href: `/${teamSlug}/${projectSlug}/settings`,
          icon: 'settings',
          label: 'Settings',
        },
      ]}
    />
  )
}
