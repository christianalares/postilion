import { nanoid } from 'nanoid'
import { customAlphabet } from 'nanoid'
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

		return createdOrganization
	} catch (error) {
		console.error(error)
		throw error
	}
}
