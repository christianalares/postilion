'use client'

import { useProjectSlug } from '@/hooks/use-project-slug'
import { useTeamSlug } from '@/hooks/use-team-slug'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { Icon, type IconName } from './ui/icon'

export const MainMenu = () => {
  const teamSlug = useTeamSlug()
  const projectSlug = useProjectSlug()
  const segment = useSelectedLayoutSegment()

  return (
    <nav>
      <ul>
        <MenuItem isActive={segment === null} href={`/${teamSlug}/${projectSlug}`} icon="home" label="Home" />
        <MenuItem
          isActive={segment === 'messages'}
          href={`/${teamSlug}/${projectSlug}/messages`}
          icon="message"
          label="Messages"
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
        className={cn('flex items-center justify-center h-16 hover:bg-muted/50 transition-colors', {
          'bg-muted/50': isActive,
        })}
      >
        <Icon name={icon} className="size-6" strokeWidth={isActive ? 2 : 1} />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  )
}
