'use client'

import { authClient } from '@/lib/auth-client'

const LoginPage = () => {
	const loginWithGitHub = async () => {
		const data = await authClient.signIn.social({
			provider: 'github',
			callbackURL: '/',
		})

		console.log(1, data)
	}

	return (
		<div>
			<button type="button" onClick={loginWithGitHub}>
				Sign in with GitHub
			</button>
		</div>
	)
}

export default LoginPage
