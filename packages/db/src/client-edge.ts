import { withAccelerate } from '@prisma/extension-accelerate'
// import { withOptimize } from '@prisma/extension-optimize'
import { PrismaClient } from '../generated/client/edge'

export const createPrismaClient = (url?: string) => {
  const client = new PrismaClient({
    datasourceUrl: url ?? process.env.DATABASE_URL,
  }).$extends(withAccelerate())
  // .$extends(
  //   withOptimize({
  //     apiKey: process.env.OPTIMIZE_API_KEY!,
  //   }),
  // )

  return client
}
