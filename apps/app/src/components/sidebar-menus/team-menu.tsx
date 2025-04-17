'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { usePathname } from 'next/navigation'
import { Menu } from './menu-items'

export const TeamMenu = () => {
  const teamSlug = useTeamSlug()
  const pathname = usePathname()

  return (
    <Menu
      items={[
        {
          isActive: pathname === `/${teamSlug}`,
          href: `/${teamSlug}`,
          icon: 'home',
          label: 'Projects',
        },
        {
          isActive: pathname.startsWith(`/${teamSlug}/domains`),
          href: `/${teamSlug}/domains`,
          icon: 'globe',
          label: 'Domains',
        },
        {
          isActive: pathname.startsWith(`/${teamSlug}/settings`),
          href: `/${teamSlug}/settings`,
          icon: 'settings',
          label: 'Settings',
        },
      ]}
    />
  )
}
