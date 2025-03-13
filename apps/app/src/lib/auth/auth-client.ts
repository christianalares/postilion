import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

type AuthClient = ReturnType<typeof createAuthClient>

export const authClient: AuthClient = createAuthClient({
	plugins: [organizationClient()],
})
