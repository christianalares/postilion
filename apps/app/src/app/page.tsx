import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function Home() {
	const sessions = await auth.api.getSession({
		headers: await headers(),
	})

	console.log(2, sessions)

	return <div>asd</div>
}
