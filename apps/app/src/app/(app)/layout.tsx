import { Header } from '@/components/header'
import { HydrateClient, trpc } from '@/trpc/server'

type Props = {
	children: React.ReactNode
}

const AuthorizedLayout = ({ children }: Props) => {
	trpc.users.me.prefetch()

	return (
		<HydrateClient>
			<Header />
			<div className="border-2 border-red-400">{children}</div>
		</HydrateClient>
	)
}

export default AuthorizedLayout
