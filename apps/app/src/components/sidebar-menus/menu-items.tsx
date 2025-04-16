'use client'

import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import Link, { type LinkProps } from 'next/link'
import { Icon, type IconName } from '../ui/icon'

type MenuItem = {
  isActive: boolean
  href: LinkProps['href']
  icon: IconName
  label: string
  onClick?: LinkProps['onClick']
}

type Props = {
  items: MenuItem[]
}

export const Menu = ({ items }: Props) => {
  return (
    <nav>
      <ul>
        {items.map((item) => (
          // group-has-[.trial-countdown]:first:border-t
          <li key={item.href.toString()} className="border-b">
            <Link
              onClick={item.onClick}
              href={item.href}
              className={cn('flex items-center hover:bg-muted/50 transition-colors gap-2 py-3 px-6 relative')}
            >
              {item.isActive && (
                <motion.div
                  aria-hidden
                  layoutId="sidebar-menu-item-underline"
                  className="absolute left-3 w-0.5 h-1/2 bg-muted-foreground"
                />
              )}
              <Icon name={item.icon} className="size-4" strokeWidth={item.isActive ? 2 : 1} />
              <span className="text-sm">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
