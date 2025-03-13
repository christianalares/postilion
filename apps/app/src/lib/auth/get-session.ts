import { headers } from 'next/headers'
import type { auth } from './auth'

type Session = typeof auth.$Infer.Session

export const getSession = async () => {
	try {
		const res = await fetch(
			`${process.env.BETTER_AUTH_URL}/api/auth/get-session`,
			{
				headers: {
					cookie: (await headers()).get('cookie') ?? '',
				},
			},
		)

		if (!res.ok) {
			return null
		}

		const session = (await res.json()) as Session | null

		return session
	} catch (error) {
		return null
	}
}
