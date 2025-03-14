import { isPrismaError } from '@postilion/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, createTRPCRouter } from '../init'
import { hasTeamRole, isMemberOfTeam } from '../middlewares/team'

const getBySlug = authProcedure
	.input(
		z.object({
			slug: z.string(),
		}),
	)
	.use(isMemberOfTeam)
	.query(async ({ ctx, input }) => {
		try {
			const team = await ctx.prisma.team.findUnique({
				where: { slug: input.slug },
			})

			if (!team) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Team not found',
				})
			}

			return team
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to get team',
			})
		}
	})

const update = authProcedure
	.input(
		z.object({
			slug: z.string(),
			data: z.object({
				name: z.union([z.string(), z.undefined()]),
				slug: z.union([z.string(), z.undefined()]),
			}),
		}),
	)
	.use(hasTeamRole('OWNER'))
	.mutation(async ({ ctx, input }) => {
		try {
			const updatedTeam = await ctx.prisma.team.update({
				where: {
					slug: input.slug,
				},
				data: {
					name: input.data.name,
					slug: input.data.slug,
				},
			})

			return updatedTeam
		} catch (error) {
			// P2002 = unique constraint violation
			if (isPrismaError(error) && error.code === 'P2002') {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Team slug is already taken',
				})
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to update team',
			})
		}
	})

export const teamsRouter = createTRPCRouter({
	update,
	getBySlug,
})
