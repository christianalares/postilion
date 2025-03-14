'use client'

import { authClient } from '@/lib/auth/auth-client'
import { trpc } from '@/trpc/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const ThemeSwitcher = dynamic(
	() =>
		import('@/components/theme-switcher').then(
			({ ThemeSwitcher }) => ThemeSwitcher,
		),
	{
		ssr: false,
		// loading: () => <Skeleton className="w-36 h-8" />,
	},
)

export const Header = () => {
	const router = useRouter()
	const [me] = trpc.users.me.useSuspenseQuery()

	return (
		<header className="flex justify-between h-16 items-center border-b px-6">
			<div>
				<p>{me.name}</p>
			</div>

			<div className="flex gap-4 items-center">
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

				<ThemeSwitcher />
			</div>
		</header>
	)
}
