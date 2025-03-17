import { TeamsDropdown } from './teams-dropdown'

import { Suspense } from 'react'
import { ProjectsDropdown } from './projects-dropdown'
import { TeamsDropdownSkeleton } from './teams-dropdown'

export const HeaderDropdowns = () => {
  return (
    <div className="flex gap-2 items-center">
      <Suspense fallback={<TeamsDropdownSkeleton />}>
        <TeamsDropdown />
      </Suspense>

      <span className="w-px bg-foreground/50 self-stretch scale-y-50 -skew-[15deg] mx-1" />

      <Suspense fallback={<TeamsDropdownSkeleton />}>
        <ProjectsDropdown />
      </Suspense>
    </div>
  )
}
