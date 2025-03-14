import { TeamNameForm } from '@/components/settings/team-name-form'
import { TeamSlugForm } from '@/components/settings/team-slug-form'

const TeamPage = () => {
	return (
		<div className="space-y-8">
			<TeamNameForm />
			<TeamSlugForm />
		</div>
	)
}

export default TeamPage
