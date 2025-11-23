import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log database queries in development
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log database connection for debugging
if (process.env.NODE_ENV === 'development') {
  console.log(
    'Prisma client initialized with database:',
    process.env.DATABASE_URL ? 'SET' : 'NOT SET'
  );
}
