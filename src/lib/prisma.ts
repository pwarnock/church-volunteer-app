import { PrismaClient } from '../generated/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // The build script (package.json "build:next") handles schema selection:
  // - On Vercel or with POSTGRES_URL: uses schema-prod.prisma (postgresql)
  // - Locally without POSTGRES_URL: uses schema-local.prisma (sqlite)
  //
  // The generated client type varies based on the schema used at build time.
  // At runtime, we pass the appropriate options.

  const logConfig =
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'];

  // When PRISMA_DATABASE_URL is set, use Prisma Accelerate for runtime queries
  // This provides connection pooling and caching for production
  if (process.env.PRISMA_DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (PrismaClient as any)({
      accelerateUrl: process.env.PRISMA_DATABASE_URL,
      log: logConfig,
    });
  }

  // Local development with SQLite
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (PrismaClient as any)({
    log: logConfig,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log database connection for debugging
if (process.env.NODE_ENV === 'development') {
  const dbType = process.env.PRISMA_DATABASE_URL ? 'Prisma Accelerate' : 'SQLite';
  console.log(`🗄️ Prisma client initialized with ${dbType}`);
}
