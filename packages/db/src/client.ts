export type { PrismaPromise } from '../generated/client'
import { createPrismaClient } from './client-edge'

const globalForPrisma = global as unknown as { prisma: ReturnType<typeof createPrismaClient> }

export const prisma = globalForPrisma.prisma || createPrismaClient()
export type PrismaClient = typeof prisma

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
