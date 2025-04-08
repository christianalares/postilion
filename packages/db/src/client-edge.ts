import { withAccelerate } from '@prisma/extension-accelerate'
// import { withOptimize } from '@prisma/extension-optimize'
import { PrismaClient } from '../generated/client/edge'

export const createPrismaClient = (url?: string) => {
  const client = new PrismaClient({
    datasourceUrl: url ?? process.env.DATABASE_URL,
  })
    .$extends(withAccelerate())
    .$extends({
      result: {
        team: {
          needs_subscription: {
            needs: {
              end_free_trial: true,
              subscription_id: true,
            },
            compute: (team) => {
              const trialDateIsPast = !!team.end_free_trial && new Date(team.end_free_trial) < new Date()
              return trialDateIsPast && !team.subscription_id
            },
          },
        },
      },
    })
  // .$extends(
  //   withOptimize({
  //     apiKey: process.env.OPTIMIZE_API_KEY!,
  //   }),
  // )

  return client
}
