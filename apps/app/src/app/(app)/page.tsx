import { trpc } from '@/trpc/server'

const AuthorizedPage = async () => {
  const user = await trpc.users.me()

  return <div>AuthorizedPage: {user.name}</div>
}

export default AuthorizedPage
