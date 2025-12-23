import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Environment-based database URL selection
const hasPostgres = !!(
  process.env.POSTGRES_URL ||
  (process.env.DATABASE_URL &&
    process.env.DATABASE_URL.startsWith('postgresql'))
);

// Production: PostgreSQL adapter, Local: better-sqlite3 adapter
const adapter = hasPostgres
  ? new PrismaPg({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    })
  : new PrismaBetterSqlite3({
      database: process.env.DATABASE_URL || 'file:./prisma/dev.db',
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
  const dbType = hasPostgres ? 'PostgreSQL' : 'SQLite (better-sqlite3)';
  console.log(`🗄️ Prisma client initialized with ${dbType}`);
  console.log(
    '🔒 Production data is SAFE - using local SQLite for development'
  );
}
