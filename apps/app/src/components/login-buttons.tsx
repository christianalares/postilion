'use client'

import { authClient } from '@/lib/auth-client'

type Props = {
	redirectTo?: string
}

export const LoginButtons = ({ redirectTo }: Props) => {
	const loginWithGitHub = async () => {
		authClient.signIn.social({
			provider: 'github',
			callbackURL: redirectTo ?? '/',
		})
	}

	return (
		<div className="flex flex-col gap-2 border p-4">
			<button type="button" onClick={loginWithGitHub}>
				Login with GitHub
			</button>
		</div>
	)
}
