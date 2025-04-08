'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { useSelectedLayoutSegments } from 'next/navigation'
import { Menu } from './menu-items'

export const TeamMenu = () => {
  const teamSlug = useTeamSlug()
  const segments = useSelectedLayoutSegments()

  return (
    <Menu
      items={[
        {
          isActive: segments.length === 0,
          href: `/${teamSlug}`,
          icon: 'home',
          label: 'Projects',
        },
        {
          isActive: segments[0] === 'domains',
          href: `/${teamSlug}/domains`,
          icon: 'globe',
          label: 'Domains',
        },
        {
          isActive: segments[0] === 'settings',
          href: `/${teamSlug}/settings`,
          icon: 'settings',
          label: 'Settings',
        },
      ]}
    />
  )
}
