import { Webhooks } from '@polar-sh/nextjs'
import { PolarClient } from '@postilion/billing'
import { prisma } from '@postilion/db'
// import { createPrismaClient } from '@postilion/db/edge'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    // console.dir(payload, { depth: Infinity })

    // WHEN USER CREATES A SUBSCRIPTION
    if (payload.type === 'subscription.active') {
      try {
        // const prisma = createPrismaClient(process.env.DATABASE_URL!)
        const polarClient = new PolarClient(process.env.POLAR_ACCESS_TOKEN!)

        const product = await polarClient.getProduct(payload.data.productId)

        if (!payload.data.customer.externalId) {
          throw new Error('Customer externalId is missing')
        }

        await prisma.team.update({
          where: {
            id: payload.data.customer.externalId,
          },
          data: {
            end_free_trial: null,
            subscription_product_id: product.id,
          },
        })
      } catch (error) {
        console.error(error)
        throw new Error('Failed to update team')
      }
    }
    // WHEN USER UPDATES THEIR SUBSCRIPTION
    else if (payload.type === 'subscription.updated') {
      try {
        if (!payload.data.customer.externalId) {
          throw new Error('Customer externalId is missing')
        }

        await prisma.team.update({
          where: {
            id: payload.data.customer.externalId,
          },
          data: {
            subscription_product_id: payload.data.productId,
          },
        })
      } catch (error) {
        console.error(error)
        throw new Error('Failed to get subscription')
      }
    }
  },
})
