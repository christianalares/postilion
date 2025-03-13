import { prisma } from '@postilion/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { organization } from 'better-auth/plugins'
import { createDefaultOrganization } from './utils'

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
	plugins: [organization(), nextCookies()],
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await createDefaultOrganization(user)
				},
			},
		},
	},
})
