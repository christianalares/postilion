import { createPrismaClient } from './client-edge'

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
