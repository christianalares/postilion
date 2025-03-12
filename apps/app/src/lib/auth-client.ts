import { createAuthClient } from 'better-auth/react'

type AuthClient = ReturnType<typeof createAuthClient>

export const authClient: AuthClient = createAuthClient({
	baseURL: 'http://localhost:3000',
})
