import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Use PostgreSQL if POSTGRES_URL is set (production/preview)
// Otherwise use SQLite (local/CI)
const isProduction = !!process.env.POSTGRES_URL;
const provider = isProduction ? 'postgresql' : 'sqlite';
const url = isProduction
  ? (process.env.POSTGRES_URL as string)
  : 'file:./prisma/dev.db';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    provider,
    url,
  },
});
