'use client'

import { useRouter } from 'next/navigation'
import { Logo } from './logo'
import { UserDropdown } from './user-dropdown'

type Props = {
  children: React.ReactNode
}
export const Header = ({ children }: Props) => {
  return (
    <header className="flex justify-between h-16 items-center border-b px-6">
      <div className="flex items-center gap-4">
        <Logo />
        {children}
      </div>

      <UserDropdown />
    </header>
  )
}
