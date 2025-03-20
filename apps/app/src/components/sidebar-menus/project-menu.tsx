'use client'

import { Icon, type IconName } from '@/components/ui/icon'
import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname, useSelectedLayoutSegment, useSelectedLayoutSegments } from 'next/navigation'

export const ProjectMenu = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const segment = useSelectedLayoutSegment()

  return (
    <nav>
      <ul>
        <MenuItem
          isActive={segment === null || segment === 'm'}
          href={`/${teamSlug}/${projectSlug}`}
          icon="message"
          label="Messages"
        />
        <MenuItem
          isActive={segment === 'triggers'}
          href={`/${teamSlug}/${projectSlug}/triggers`}
          icon="webhook"
          label="Triggers"
        />
        <MenuItem
          isActive={segment === 'settings'}
          href={`/${teamSlug}/${projectSlug}/settings`}
          icon="settings"
          label="Settings"
        />
      </ul>
    </nav>
  )
}

type MenuItemProps = {
  href: string
  icon: IconName
  label: string
  isActive: boolean
}
const MenuItem = ({ href, icon, label, isActive }: MenuItemProps) => {
  return (
    <li className="border-b">
      <Link
        href={href}
        className={cn('flex items-center hover:bg-muted/50 transition-colors gap-2 py-3 px-6 relative')}
      >
        {isActive && (
          <motion.div
            aria-hidden
            layoutId="sidebar-menu-item-underline"
            className="absolute left-3 w-0.5 h-1/2 bg-muted-foreground"
          />
        )}
        <Icon name={icon} className="size-4" strokeWidth={isActive ? 2 : 1} />
        <span className="text-sm">{label}</span>
      </Link>
    </li>
  )
}
