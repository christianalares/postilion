import { auth } from '@/lib/auth/auth'
import { prisma } from '@postilion/db'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

const AuthorizedPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // This should never happen as it's already doing this in the middleware so it's more for type safety
  if (!session) {
    redirect('/sign-in')
  }

  const firstFoundTeam = await prisma.team.findFirst({
    where: {
      members: {
        some: {
          user_id: session.user.id,
        },
      },
    },
  })

  if (firstFoundTeam) {
    redirect(`/${firstFoundTeam.slug}/default`)
  }

  notFound()
}

export default AuthorizedPage
