import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { Link } from 'lucide-react'
import { motion } from 'motion/react'

type Item = {
  isActive: boolean
  href: string
  icon: IconName
  label: string
}

type Props = {
  items: Item[]
}
export const SidebarMenu = ({ items }: Props) => {
  return (
    <nav>
      <ul>
        {items.map((item) => (
          <MenuItem key={item.href} isActive={item.isActive} href={item.href} icon={item.icon} label={item.label} />
        ))}
      </ul>
    </nav>
  )
}

const MenuItem = ({ href, icon, label, isActive }: Item) => {
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
