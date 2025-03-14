import type { TEAM_ROLE_ENUM } from '@postilion/db'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { t } from '../init'

const teamSlugSchema = z.object({
	slug: z.string(),
})

export const isMemberOfTeam = t.middleware(async ({ ctx, input, next }) => {
	if (!ctx.user) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You must be logged in to access this resource',
		})
	}

	const parsedInput = teamSlugSchema.safeParse(input)

	if (!parsedInput.success) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Invalid team id',
		})
	}

	try {
		const team = await ctx.prisma.team.findFirst({
			where: {
				slug: parsedInput.data.slug,
				members: {
					some: {
						user_id: ctx.user.id,
					},
				},
			},
		})

		if (!team) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message: 'You are not a member of this team',
			})
		}

		return next()
	} catch (error) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Failed to check if user is in team',
		})
	}
})

export const hasTeamRole = (role: TEAM_ROLE_ENUM) =>
	t.middleware(async ({ ctx, input, next }) => {
		if (!ctx.user) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'You must be logged in to access this resource',
			})
		}

		const parsedInput = teamSlugSchema.safeParse(input)

		if (!parsedInput.success) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Invalid team id',
			})
		}

		try {
			const team = await ctx.prisma.team.findFirst({
				where: {
					slug: parsedInput.data.slug,
					members: {
						some: {
							user_id: ctx.user.id,
							role,
						},
					},
				},
			})

			if (!team) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: "You don't have permission to access this resource",
				})
			}

			return next()
		} catch (error) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to check if user is team owner',
			})
		}
	})
