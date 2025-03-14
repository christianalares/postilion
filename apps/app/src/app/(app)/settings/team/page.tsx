import { TeamNameForm } from '@/components/settings/team-name-form'

export const dynamic = 'force-dynamic'

const TeamPage = () => {
  return (
    <div className="space-y-8">
      <TeamNameForm />
    </div>
  )
}

export default TeamPage
