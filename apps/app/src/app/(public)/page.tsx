import { auth } from '@/lib/auth/auth'
import { prisma } from '@postilion/db'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const AuthorizedPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
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
    redirect(`/${firstFoundTeam.slug}`)
  }

  redirect('/create-team')
}

export default AuthorizedPage
