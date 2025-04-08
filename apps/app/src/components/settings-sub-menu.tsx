'use client'

import { useTeamSlug } from '@/hooks/use-team-slug'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

export const SettingsSubMenu = () => {
  const teamSlug = useTeamSlug()
  const segment = useSelectedLayoutSegment()

  return (
    <nav>
      <ul className="flex items-center gap-4">
        <MenuItem isActive={segment === null} href={`/${teamSlug}/settings`} label="General" />
        <MenuItem isActive={segment === 'billing'} href={`/${teamSlug}/settings/billing`} label="Billing" />
      </ul>
    </nav>
  )
}

type MenuItemProps = {
  href: string
  label: string
  isActive: boolean
}

const MenuItem = ({ href, label, isActive }: MenuItemProps) => {
  return (
    <li className="relative">
      <Link href={href}>
        <span>{label}</span>
      </Link>

      {isActive && (
        <motion.div
          layoutId="account-sub-nav-underline"
          className="absolute -bottom-1 left-0 w-full h-0.5 bg-muted-foreground"
        />
      )}
    </li>
  )
}
