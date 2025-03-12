import { type NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const OPEN_PATHS = ['/login']

export async function middleware(req: NextRequest) {
	const nextUrl = req.nextUrl

	const sessionCookie = getSessionCookie(req)

	if (!sessionCookie && !OPEN_PATHS.includes(nextUrl.pathname)) {
		return NextResponse.redirect(
			new URL(`/login?return_to=${req.nextUrl.pathname}`, req.url),
		)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - opengraph-image.jpg (opengraph image file)
		 * - .(?:svg|png|jpg|jpeg|gif|webp) (image files)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|opengraph-image.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
