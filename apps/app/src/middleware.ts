import { getSessionCookie } from 'better-auth/cookies'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import picomatch from 'picomatch'

const OPEN_PATHS = ['/login', '/invite/*']

export async function middleware(req: NextRequest) {
  const nextUrl = req.nextUrl
  const redirectTo = req.cookies.get('redirectTo')?.value

  const sessionCookie = getSessionCookie(req)

  const isOpenPath = OPEN_PATHS.some((pattern) => picomatch(pattern)(nextUrl.pathname))

  if (!sessionCookie && !isOpenPath) {
    const returnTo =
      req.nextUrl.pathname === '/'
        ? new URL('/login', req.url)
        : new URL(`/login?return_to=${req.nextUrl.pathname}`, req.url)

    return NextResponse.redirect(returnTo)
  }

  if (redirectTo) {
    const cookieStore = await cookies()
    cookieStore.delete('redirectTo')

    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - opengraph-image.jpg (opengraph image file)
     * - .(?:svg|png|jpg|jpeg|gif|webp) (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
