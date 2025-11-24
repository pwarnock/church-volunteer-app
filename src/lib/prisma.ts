import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Environment-based database URL selection
const isProduction = process.env.NODE_ENV === 'production';
const DATABASE_URL =
  isProduction && process.env.POSTGRES_URL
    ? process.env.POSTGRES_URL
    : process.env.LOCAL_DB_URL || 'file:./prisma/dev.db';

// Production: PostgreSQL adapter, Local: libsql adapter (Bun-compatible)
const adapter =
  isProduction && process.env.POSTGRES_URL
    ? new PrismaPg({ connectionString: process.env.POSTGRES_URL })
    : new PrismaLibSql({ url: DATABASE_URL });

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
  const dbType = isProduction ? 'PostgreSQL (Production)' : 'SQLite (Local)';
  console.log(`🗄️ Prisma client initialized with ${dbType}`);
  console.log(`📍 Database: ${DATABASE_URL}`);
  console.log(
    '🔒 Production data is SAFE - using local SQLite for development'
  );
}
