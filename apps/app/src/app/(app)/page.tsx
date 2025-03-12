import { trpc } from '@/trpc/server'

const AuthorizedPage = async () => {
	const data = await trpc.users.me()
	console.log('data', data)

	return <div>AuthorizedPage: {data.name}</div>
}

export default AuthorizedPage
