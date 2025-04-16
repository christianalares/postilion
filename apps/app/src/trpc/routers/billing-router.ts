import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { isTeamMember, isTeamOwner } from '../middlewares/team'

const getProducts = authProcedure.query(async ({ ctx }) => {
  const products = await ctx.polarClient.getProducts()
  return products
})

const createCheckout = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      productId: z.string(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const successUrl = new URL(
      process.env.NODE_ENV === 'development'
        ? 'https://localhost3000-80.localcan.dev/api/checkout/success'
        : `https://${process.env.VERCEL_URL}/api/checkout/success`,
    )

    successUrl.searchParams.set('redirectTo', `/${ctx.team.slug}/settings/billing`)

    const checkout = await ctx.polarClient.createCheckout({
      productId: input.productId,
      customerEmail: ctx.user.email,
      customerName: ctx.user.name,
      customerExternalId: ctx.team.id,
      successUrl: successUrl.toString(),
      metadata: {
        teamId: ctx.team.id,
        teamName: ctx.team.name,
      },
    })

    return {
      url: checkout.url,
    }
  })

const createPortal = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx }) => {
    const portal = await ctx.polarClient.createPortal({ customerExternalId: ctx.team.id })

    return {
      url: portal.url,
    }
  })

const getSubscription = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamMember)
  .query(async ({ ctx }) => {
    if (!ctx.team.subscription_id) {
      return null
    }

    const subscription = await ctx.polarClient.getSubscription({ subscriptionId: ctx.team.subscription_id })

    return subscription
  })

const updateSubscription = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      productId: z.string(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ input, ctx }) => {
    if (!ctx.team.subscription_id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Team does not have a subscription',
      })
    }

    const products = await ctx.polarClient.getProducts()
    const foundProduct = products.find((product) => product.id === input.productId)

    if (!foundProduct) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Product not found',
      })
    }

    const updatedSubscription = await ctx.polarClient.updateSubscription({
      subscriptionId: ctx.team.subscription_id,
      productId: foundProduct.id,
    })

    return updatedSubscription
  })

const cancelSubscription = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx }) => {
    if (!ctx.team.subscription_id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Team does not have a subscription',
      })
    }

    const cancelledSubscription = await ctx.polarClient.cancelSubscription({ subscriptionId: ctx.team.subscription_id })

    return cancelledSubscription
  })

const reactivateSubscription = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .use(isTeamOwner)
  .mutation(async ({ ctx }) => {
    if (!ctx.team.subscription_id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Team does not have a subscription',
      })
    }

    const reactivatedSubscription = await ctx.polarClient.reactivateSubscription({
      subscriptionId: ctx.team.subscription_id,
    })

    return reactivatedSubscription
  })

export const billingRouter = createTRPCRouter({
  getProducts,
  createCheckout,
  createPortal,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
})
