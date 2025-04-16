'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { useSelectedLayoutSegment } from 'next/navigation'
import { popSheet } from '../sheets'
import { Menu } from './menu-items'

type Props = {
  mobile?: boolean
}

export const ProjectMenu = ({ mobile }: Props) => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const segment = useSelectedLayoutSegment()

  const onClick = () => {
    if (mobile) {
      popSheet('mobileMenuSheet')
    }
  }

  return (
    <Menu
      items={[
        {
          isActive: segment === null,
          href: `/${teamSlug}/${projectSlug}`,
          icon: 'dashboard',
          label: 'Dashboard',
          onClick,
        },
        {
          isActive: segment === 'messages',
          href: `/${teamSlug}/${projectSlug}/messages`,
          icon: 'message',
          label: 'Messages',
          onClick,
        },
        {
          isActive: segment === 'webhooks',
          href: `/${teamSlug}/${projectSlug}/webhooks`,
          icon: 'webhook',
          label: 'Webhooks',
          onClick,
        },
        {
          isActive: segment === 'settings',
          href: `/${teamSlug}/${projectSlug}/settings`,
          icon: 'settings',
          label: 'Settings',
          onClick,
        },
      ]}
    />
  )
}
