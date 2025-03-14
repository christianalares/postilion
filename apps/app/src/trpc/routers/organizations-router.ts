import { auth } from '@/lib/auth/auth'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'

export const organizationsRouter = createTRPCRouter({
	updateName: authProcedure
		.input(
			z.object({
				teamId: z.string(),
				teamName: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const updatedUser = await ctx.prisma.organization.update({
					where: {
						id: input.teamId,
						// Member has to be owner of the team
						members: {
							some: {
								id: ctx.user.id,
								role: 'owner',
							},
						},
					},
					data: {
						name: input.teamName,
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
})
