import { Webhooks } from '@polar-sh/nextjs'
import { prisma } from '@postilion/db'
// import { PolarClient } from '@postilion/billing'
// import { prisma } from '@postilion/db'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.dir(payload, { depth: Number.POSITIVE_INFINITY })

    // Subscription created
    if (payload.type === 'subscription.active') {
      if (!payload.data.customer.externalId) {
        throw new Error('Customer external ID is required')
      }

      await prisma.team.update({
        where: {
          id: payload.data.customer.externalId,
        },
        data: {
          subscription_id: payload.data.id,
        },
      })
    }

    // Subscription updated or changed
    else if (payload.type === 'subscription.updated') {
      if (!payload.data.customer.externalId) {
        throw new Error('Customer external ID is required')
      }

      // Only update subscription_id if the status is not 'canceled'
      // This prevents the final 'updated' event from overwriting the null value set by 'revoked'
      if (payload.data.status !== 'canceled') {
        await prisma.team.update({
          where: {
            id: payload.data.customer.externalId,
          },
          data: {
            subscription_id: payload.data.id,
          },
        })
      }
    }

    // Subscription revoked
    else if (payload.type === 'subscription.revoked') {
      if (!payload.data.customer.externalId) {
        throw new Error('Customer external ID is required')
      }

      await prisma.team.update({
        where: {
          id: payload.data.customer.externalId,
        },
        data: {
          subscription_id: null,
        },
      })
    }

    // Subscription uncanceled
    else if (payload.type === 'subscription.uncanceled') {
      if (!payload.data.customer.externalId) {
        throw new Error('Customer external ID is required')
      }

      await prisma.team.update({
        where: {
          id: payload.data.customer.externalId,
        },
        data: {
          subscription_id: payload.data.id,
        },
      })
    }
  },
})
