import { mutations } from '@postilion/db/mutations'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

const update = authProcedure
  .input(
    z.object({
      name: z.union([z.string(), z.undefined()]),
      email: z.union([z.string().email(), z.undefined()]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const updatedUser = await mutations.users
      .updateUser(ctx.prisma, {
        userId: ctx.user.id,
        data: {
          name: input.name,
          email: input.email,
        },
      })
      .catch(() => {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
        })
      })

    ctx.analyticsClient.track('user_updated', {
      user_id: updatedUser.id,
      from: {
        name: input.name,
        email: input.email,
      },
      to: {
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })

    return updatedUser
  })

const me = authProcedure.query(async ({ ctx }) => {
  return ctx.user
})

export const usersRouter = createTRPCRouter({
  me,
  update,
})
