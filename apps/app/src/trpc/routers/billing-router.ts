import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

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
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          members: {
            select: {
              role: true,
              user_id: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (userOnTeam.role !== 'OWNER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an owner of this team',
      })
    }

    const successUrl = new URL(
      process.env.NODE_ENV === 'development'
        ? 'https://localhost3000-80.localcan.dev/api/checkout/success'
        : `https://${process.env.VERCEL_URL}/api/checkout/success`,
    )

    successUrl.searchParams.set('redirectTo', `/${team.slug}/settings/billing`)

    const checkout = await ctx.polarClient.createCheckout({
      productId: input.productId,
      customerEmail: ctx.user.email,
      customerName: ctx.user.name,
      customerExternalId: team.id,
      successUrl: successUrl.toString(),
      metadata: {
        teamId: team.id,
        teamName: team.name,
      },
    })

    return {
      url: checkout.url,
    }
  })

// const getPlan = authProcedure
//   .input(
//     z.object({
//       teamSlug: z.string(),
//     }),
//   )
//   .query(async ({ ctx, input }) => {
//     const team = await ctx.prisma.team
//       .findUnique({
//         where: {
//           slug: input.teamSlug,
//         },
//         select: {
//           id: true,
//           subscription_product_id: true,
//           members: {
//             select: {
//               user_id: true,
//             },
//           },
//         },
//       })
//       .catch(() => {
//         throw new TRPCError({
//           code: 'INTERNAL_SERVER_ERROR',
//           message: 'Failed to get team',
//         })
//       })

//     if (!team) {
//       throw new TRPCError({
//         code: 'NOT_FOUND',
//         message: 'Team not found',
//       })
//     }

//     const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

//     if (!userOnTeam) {
//       throw new TRPCError({
//         code: 'FORBIDDEN',
//         message: 'You are not a member of this team',
//       })
//     }

//     if (!team.subscription_product_id) {
//       return null
//     }

//     const product = await ctx.polarClient.getProduct(team.subscription_product_id)

//     if (!product) {
//       throw new TRPCError({
//         code: 'INTERNAL_SERVER_ERROR',
//         message: 'Failed to get product',
//       })
//     }

//     return {
//       id: product.id,
//       plan: product.name,
//     }
//   })

const createPortal = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        select: {
          id: true,
          members: {
            select: {
              role: true,
              user_id: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (userOnTeam.role !== 'OWNER') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an owner of this team',
      })
    }

    const portal = await ctx.polarClient.createPortal({ customerExternalId: team.id })

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
  .query(async ({ input, ctx }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        select: {
          id: true,
          members: {
            select: {
              user_id: true,
              role: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    const subscription = await ctx.polarClient.getSubscription({ teamId: team.id })

    return subscription
  })

const updateSubscription = authProcedure
  .input(
    z.object({
      teamSlug: z.string(),
      productId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const team = await ctx.prisma.team
      .findUnique({
        where: {
          slug: input.teamSlug,
        },
        select: {
          id: true,
          subscription_product_id: true,
          members: {
            select: {
              user_id: true,
              role: true,
            },
          },
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get team',
        })
      })

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    const userOnTeam = team.members.find((member) => member.user_id === ctx.user.id)

    if (!userOnTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not a member of this team',
      })
    }

    if (!team.subscription_product_id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Team does not have a subscription',
      })
    }

    const subscription = await ctx.polarClient.getSubscription({ teamId: team.id })

    if (!subscription) {
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
      subscriptionId: subscription.id,
      productId: foundProduct.id,
    })

    return updatedSubscription
  })

export const billingRouter = createTRPCRouter({
  getProducts,
  createCheckout,
  // getPlan,
  createPortal,
  getSubscription,
  updateSubscription,
})
