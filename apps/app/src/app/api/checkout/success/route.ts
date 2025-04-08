import { type NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : process.env.VERCEL_URL || req.url

  // const customerSessionToken = req.nextUrl.searchParams.get('customer_session_token')

  // if (!customerSessionToken) {
  //   return NextResponse.redirect(new URL('/', req.url))
  // }

  // const customerSession = await polarClient.getCustomerSession(customerSessionToken)

  return NextResponse.redirect(new URL(redirectTo, url))
}
