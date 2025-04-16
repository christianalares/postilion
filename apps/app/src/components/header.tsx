'use client'

import { Logo } from './logo'
import { pushSheet } from './sheets'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { UserDropdown } from './user-dropdown'

type Props = {
  children: React.ReactNode
  layout?: 'team' | 'project'
}
export const Header = ({ children, layout }: Props) => {
  return (
    <header className="flex justify-between h-16 items-center border-b px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {layout && (
          <Button
            className="sm:hidden"
            variant="ghost"
            size="icon"
            onClick={() => pushSheet('mobileMenuSheet', { type: layout })}
          >
            <Icon name="menu" />
          </Button>
        )}

        <Logo className="hidden sm:block" />

        {children}
      </div>

      <UserDropdown />
    </header>
  )
}
