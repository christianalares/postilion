import { prisma } from '@postilion/db'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { jwt } from 'better-auth/plugins'
import { cookies } from 'next/headers'
import { createDefaultTeam } from './utils'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: '1h',
        definePayload: ({ user }) => ({
          id: user.id,
        }),
      },
    }),
    // bearer(),
    nextCookies(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          const cookieStore = await cookies()
          const createdTeam = await createDefaultTeam(user)

          if (createdTeam && ctx) {
            // The middleware will remove this cookie and redirect the user to the team
            cookieStore.set('redirectTo', `/${createdTeam.slug}`)
          }
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
