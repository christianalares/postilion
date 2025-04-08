import { createAnalyticsClient } from '@postilion/analytics/client'
import { prisma } from '@postilion/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { cookies } from 'next/headers'
import { createDefaultTeam, handleInvitedUser } from './utils'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const cookieStore = await cookies()

          const inviteCodeCookie = cookieStore.get('invite-code')

          if (inviteCodeCookie) {
            try {
              const userOnTeam = await handleInvitedUser(user, inviteCodeCookie.value)

              if (userOnTeam) {
                cookieStore.delete('invite-code')
                cookieStore.set('redirectTo', `/${userOnTeam.team.slug}`)
              }
            } catch (_error) {
              const createdTeam = await createDefaultTeam(user)

              if (createdTeam) {
                // The middleware will remove this cookie and redirect the user to the team
                cookieStore.set('redirectTo', `/${createdTeam.slug}`)
              }
            }
          } else {
            const createdTeam = await createDefaultTeam(user)

            if (createdTeam) {
              // The middleware will remove this cookie and redirect the user to the team
              cookieStore.set('redirectTo', `/${createdTeam.slug}`)
            }
          }

          const analyticsClient = createAnalyticsClient({
            clientId: process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!,
            clientSecret: process.env.OPENPANEL_CLIENT_SECRET!,
            profileId: user.id,
          })

          analyticsClient.track('user_created', {
            user_id: user.id,
            user_email: user.email,
            user_name: user.name,
          })
        },
      },
    },
  },
  advanced: {
    ...(process.env.NODE_ENV === 'production' && {
      defaultCookieAttributes: {
        sameSite: 'Strict',
        secure: true,
        domain: '.postilion.ai',
      },
    }),
    crossSubDomainCookies: {
      enabled: true,
    },
  },
})
