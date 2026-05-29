import { PrismaClient } from '@prisma/client';

// Re-export Prisma's generated types/enums so apps import them from one place.
export * from '@prisma/client';

// Singleton PrismaClient (avoids exhausting connections during dev hot-reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
