import { trpc } from '@/trpc/server'

const AuthorizedPage = async () => {
	const data = await trpc.users.me()

	return <div>AuthorizedPage: {data.name}</div>
}

export default AuthorizedPage
