import { PrismaClient } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use appropriate adapter based on environment
const adapter = process.env.POSTGRES_URL
  ? new PrismaPg({
      connectionString: process.env.POSTGRES_URL,
    })
  : new PrismaBetterSqlite3({
      url: 'file:./prisma/dev.db',
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
  console.log(
    'Prisma client initialized with database:',
    process.env.POSTGRES_URL ? 'PostgreSQL' : 'SQLite'
  );
}
