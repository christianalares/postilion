import { prisma } from '@postilion/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { organization } from 'better-auth/plugins'
import { cookies } from 'next/headers'
import { createDefaultOrganization, setActiveOrganization } from './utils'

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
	plugins: [
		organization({
			organizationCreation: {
				afterCreate: async (data, request) => {
					// const activeOrganization = await auth.api.setActiveOrganization({
					// 	body: {
					// 		organizationId: data.organization.id,
					// 	},
					// })
					// console.log('activeOrganization', activeOrganization)
					// await setActiveOrganization(data.)
				},
			},
		}),
		nextCookies(),
	],
	databaseHooks: {
		user: {
			create: {
				after: async (user, ctx) => {
					const cookieStore = await cookies()
					const createdOrg = await createDefaultOrganization(user)

					if (createdOrg && ctx) {
						cookieStore.set('redirectTo', `/${createdOrg.slug}`)
					}
				},
			},
		},
		session: {
			create: {
				after: async (session) => {
					// setActiveOrganization({
					// 	sessionId: session.id,
					// 	userId: session.userId,
					// })
				},
			},
		},
	},
})
