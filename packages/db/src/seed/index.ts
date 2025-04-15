import { prisma } from '../client'
import { demoSeed } from './demo'
import { regularSeed } from './regular'

async function main() {
  const args = process.argv.slice(2)
  const isDemo = args.includes('--demo')

  try {
    if (isDemo) {
      await demoSeed()
    } else {
      await regularSeed()
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
