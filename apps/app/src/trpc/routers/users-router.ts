import { auth } from '@/lib/auth/auth'
import { authClient } from '@/lib/auth/auth-client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, baseProcedure, createTRPCRouter } from '../init'

export const usersRouter = createTRPCRouter({
	maybeMe: baseProcedure.query(async ({ ctx }) => {
		if (!ctx.user?.id) {
			return null
		}

		const me = await ctx.prisma.user.findUnique({
			where: {
				id: ctx.user.id,
			},
			include: {
				members: true,
			},
		})

		return me
	}),
	me: authProcedure.query(async ({ ctx }) => {
		const me = await ctx.prisma.user.findUnique({
			where: {
				id: ctx.user.id,
			},
			include: {
				members: true,
			},
		})

		if (!me) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'User not found',
			})
		}

		return me
	}),
	updateName: authProcedure
		.input(
			z.object({
				name: z.string(),
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
					},
				})

				return updatedUser
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						error instanceof Error ? error.message : 'Failed to update name',
				})
			}
		}),
	updateEmail: authProcedure
		.input(
			z.object({
				email: z.string().email(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedUser = await ctx.prisma.user.update({
					where: {
						id: ctx.user.id,
					},
					data: {
						email: input.email,
					},
				})

				return updatedUser
			} catch (error) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message:
						error instanceof Error ? error.message : 'Failed to update email',
				})
			}
		}),
})
