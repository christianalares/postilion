import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from '../generated/client/edge'

export const createPrismaClient = (url?: string) => {
  const client = new PrismaClient({
    datasourceUrl: url ?? process.env.DATABASE_URL,
  }).$extends(withAccelerate())

  return client
}
