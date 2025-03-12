import { createAuthClient } from 'better-auth/react'

const getBaseUrl = () => {
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`
	}

	return 'http://localhost:3000'
}

type AuthClient = ReturnType<typeof createAuthClient>

export const authClient: AuthClient = createAuthClient({
	baseURL: getBaseUrl(),
})
