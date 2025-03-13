'use client'

import { authClient } from '@/lib/auth/auth-client'
import { trpc } from '@/trpc/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const Header = () => {
	const router = useRouter()
	const [me] = trpc.users.me.useSuspenseQuery()

	return (
		<header className="flex justify-between h-16 items-center border-b px-8">
			<nav>
				<ul className="flex gap-4 items-center">
					<li>
						<Link href="/">Home</Link>
					</li>
					<li>
						<Link href="/login">Login</Link>
					</li>
				</ul>
			</nav>

			<div className="flex gap-4 items-center">
				<span>{me.name}</span>

				<button
					type="button"
					onClick={() =>
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push('/login')
								},
							},
						})
					}
				>
					Logout
				</button>
			</div>
		</header>
	)
}
