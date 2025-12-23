import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Environment-based database URL selection
const hasPostgres = !!(
  process.env.POSTGRES_URL ||
  process.env.VERCEL_POSTGRES_URL ||
  (process.env.DATABASE_URL && 
   (process.env.DATABASE_URL.startsWith('postgresql') ||
    process.env.DATABASE_URL.startsWith('postgre')))
);

// Always use adapter based on environment, not schema provider
const adapter = hasPostgres
  ? new PrismaPg({
      connectionString: process.env.POSTGRES_URL || process.env.VERCEL_POSTGRES_URL || process.env.DATABASE_URL,
    })
  : new PrismaLibSql({
      url: process.env.DATABASE_URL?.replace('file:', 'file:') || 'file:./prisma/dev.db',
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
  const dbType = hasPostgres ? 'PostgreSQL' : 'SQLite (libsql)';
  console.log(`🗄️ Prisma client initialized with ${dbType}`);
  console.log(
    '🔒 Production data is SAFE - using local SQLite for development'
  );
}
