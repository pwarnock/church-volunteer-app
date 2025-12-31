import * as dotenv from 'dotenv';
import * as path from 'path';
import { defineConfig } from 'prisma/config';

// Load environment files (.env.local takes precedence)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Environment-based database selection:
// - Local dev (default): SQLite for fast iteration with `db push`
// - Staging/Production: PostgreSQL with `migrate dev/deploy`
const usePostgres = process.env.USE_POSTGRES === 'true';

export default defineConfig({
  // Use PostgreSQL schema for staging/prod, SQLite schema for local
  schema: usePostgres ? 'prisma/schema-prod.prisma' : 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: usePostgres ? process.env.POSTGRES_URL! : 'file:./prisma/dev.db',
  },
});
