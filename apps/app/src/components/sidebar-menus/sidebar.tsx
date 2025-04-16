import { cn } from '@/lib/utils'
import { TrialCountdownMessage } from '../trial-countdown-message'

type Props = {
  children: React.ReactNode
  className?: string
}

export const Sidebar = ({ children, className }: Props) => {
  return (
    <aside className={cn('border-r w-64 group', className)}>
      <TrialCountdownMessage />
      {children}
    </aside>
  )
}
