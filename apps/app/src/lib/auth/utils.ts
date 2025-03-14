import { prisma } from '@postilion/db'
import { nanoid } from 'nanoid'
import { customAlphabet } from 'nanoid'
import { headers } from 'next/headers'
import slugify from 'slugify'
import { auth } from './auth'

const createId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

type User = (typeof auth.$Infer.Session)['user']

export const createDefaultOrganization = async (user: User) => {
	const nanoId = createId()

	const slug = slugify(user.name, {
		lower: true,
		strict: true,
		locale: 'en',
	})

	try {
		const createdOrganization = await auth.api.createOrganization({
			body: {
				name: user.name,
				slug: `${slug}-${nanoId}`,
				userId: user.id,
			},
		})

		// prisma.session.update({
		// 	where: {
		// 		user: {},
		// 	},
		// })

		console.log('asdasdasdasdasd', session)

		// prisma.session.update({
		// 	where: {
		// 		userId: user.id,

		// 	},
		// 	data: {
		// 		activeOrganizationId: createdOrganization.id,
		// 	},
		// })

		// const session = await auth.api.getSession({
		// 	headers: await headers(),
		// })

		// if (session && createdOrganization) {
		// 	await auth.api.setActiveOrganization({
		// 		body: {
		// 			organizationId: createdOrganization.id,
		// 		},
		// 	})
		// }

		return createdOrganization
	} catch (error) {
		console.error(error)
		throw error
	}
}

export const setActiveOrganization = async ({
	sessionId,
	userId,
}: { sessionId: string; userId: string }) => {
	// const session = await prisma.session.findUnique({
	// 	where: {
	// 		id: sessionId,
	// 		userId,
	// 	},
	// })
	// await prisma.session.update({
	// 	where: {
	// 		id: sessionId,
	// 		userId,
	// 	},
	// 	data: {
	// 		activeOrganizationId: orgId,
	// 	},
	// })
	// prisma.session.update({
	// 	where: {
	// 		id: sessionId,
	// 	},
	// 	data: {
	// 		activeOrganizationId: orgId,
	// 	},
	// })
	// const activeOrganization = await auth.api.setActiveOrganization({
	// 	body: {
	// 		organizationId: orgId,
	// 	},
	// })
	// return activeOrganization
}
