import { PrismaClient } from '../generated/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For now, use SQLite for both development and production
// TODO: Configure PostgreSQL for production when DATABASE_URL is available
const adapter = new PrismaLibSql({
  url:
    process.env.DATABASE_URL?.replace('file:', 'file:') ||
    'file:./prisma/dev.db',
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log database connection for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🗄️ Prisma client initialized with SQLite (libsql)');
  console.log(
    '🔒 Production data is SAFE - using local SQLite for development'
  );
}
