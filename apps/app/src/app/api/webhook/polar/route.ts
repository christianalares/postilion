import { Webhooks } from '@polar-sh/nextjs'
// import { PolarClient } from '@postilion/billing'
// import { prisma } from '@postilion/db'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // WHEN USER CREATES A SUBSCRIPTION
    if (payload.type === 'subscription.active') {
      //  ...
    }
    // WHEN USER UPDATES THEIR SUBSCRIPTION
    else if (payload.type === 'subscription.updated') {
      //  ...
    }
  },
})
