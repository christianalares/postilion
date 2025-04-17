'use client'

import { Sheet, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Logo } from '../logo'
import { ProjectMenu } from '../sidebar-menus/project-menu'
import { TeamMenu } from '../sidebar-menus/team-menu'
import { TrialCountdownMessage } from '../trial-countdown-message'

type Props = {
  type: 'team' | 'project'
}

export const MobileMenuSheet = ({ type }: Props) => {
  return (
    <Sheet side="left" className="max-w-xs">
      <SheetHeader className="mb-0">
        <SheetTitle>
          <Logo />
        </SheetTitle>
        <div className="sr-only">
          <SheetDescription>Menu</SheetDescription>
        </div>
      </SheetHeader>

      <div>
        <TrialCountdownMessage mobile />

        {type === 'team' && <TeamMenu />}
        {type === 'project' && <ProjectMenu />}
      </div>
    </Sheet>
  )
}
