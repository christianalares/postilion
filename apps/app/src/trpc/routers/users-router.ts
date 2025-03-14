import { auth } from '@/lib/auth/auth'
import { authClient } from '@/lib/auth/auth-client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, baseProcedure, createTRPCRouter } from '../init'

const update = authProcedure
  .input(
    z.object({
      name: z.union([z.string(), z.undefined()]),
      email: z.union([z.string().email(), z.undefined()]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const updatedUser = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          name: input.name,
          email: input.email,
        },
      })

      return updatedUser
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user',
      })
    }
  })

const me = authProcedure.query(async ({ ctx }) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const me = await ctx.prisma.user.findUnique({
    where: {
      id: ctx.user.id,
    },
  })

  if (!me) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    })
  }

  return me
})

export const usersRouter = createTRPCRouter({
  me,
  update,
})
