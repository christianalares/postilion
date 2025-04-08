import { TrialCountdownMessage } from '../trial-countdown-message'

type Props = {
  children: React.ReactNode
}

export const Sidebar = ({ children }: Props) => {
  return (
    <aside className="border-r w-64 group">
      <TrialCountdownMessage />
      {children}
    </aside>
  )
}
