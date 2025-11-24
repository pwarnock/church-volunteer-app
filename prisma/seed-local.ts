import { PrismaClient } from '../src/generated/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Local development only - SQLite for safety
const adapter = new PrismaBetterSqlite3({
  url: process.env.LOCAL_DB_URL || 'file:./prisma/dev.db',
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log database connection for debugging
console.log('🗄️ Local development initialized with SQLite');
console.log('📍 Database:', process.env.LOCAL_DB_URL || 'file:./prisma/dev.db');
console.log('🔒 Production data is SAFE - using isolated local SQLite');