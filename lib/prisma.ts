import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Production connection management
    ...(process.env.NODE_ENV === 'production' && {
      // Disable query logging in production for performance
      log: ['error'],
      // Connection pool settings
      __internal: {
        engine: {
          // Prevent connection conflicts
          connectionLimit: 5,
          pool: {
            min: 1,
            max: 5,
            acquireTimeoutMillis: 30000,
            createTimeoutMillis: 15000,
            destroyTimeoutMillis: 5000,
            idleTimeoutMillis: 15000,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
          },
        },
      },
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
