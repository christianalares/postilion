// import { DeleteTeamForm } from '@/components/settings/delete-team-form'
import { TeamNameForm, TeamNameFormSkeleton } from '@/components/settings/team-name-form'
import { TeamSlugForm, TeamSlugFormSkeleton } from '@/components/settings/team-slug-form'
import { Suspense } from 'react'

const TeamPage = () => {
  return (
    <div className="space-y-8">
      <Suspense fallback={<TeamNameFormSkeleton />}>
        <TeamNameForm />
      </Suspense>

      <Suspense fallback={<TeamSlugFormSkeleton />}>
        <TeamSlugForm />
      </Suspense>

      {/* <Suspense fallback={'<TeamSlugFormSkeleton />'}>
        <DeleteTeamForm />
      </Suspense> */}
    </div>
  )
}

export default TeamPage
