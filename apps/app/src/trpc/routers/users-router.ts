import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authProcedure, baseProcedure, createTRPCRouter } from '../init'

export const usersRouter = createTRPCRouter({
	maybeMe: baseProcedure.query(async ({ ctx }) => {
		if (!ctx.user?.id) {
			return null
		}

		return ctx.user
	}),
	me: authProcedure.query(async ({ ctx }) => {
		return ctx.user
	}),
})
