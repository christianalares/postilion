import { z } from 'zod'

type Params = Promise<{ teamSlug: string }>

type Props = {
	params: Params
}

const TeamPage = async ({ params }: Props) => {
	const { teamSlug } = await params
	return <div>TeamPage, {teamSlug}</div>
}

export default TeamPage
