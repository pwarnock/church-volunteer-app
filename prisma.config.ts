import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Determine provider and URL based on environment
// Priority: POSTGRES_URL > DATABASE_URL > LOCAL_DB_URL > default sqlite
const postgresUrl = process.env.POSTGRES_URL;
const databaseUrl = process.env.DATABASE_URL;
const localDbUrl = process.env.LOCAL_DB_URL;

const hasPostgresUrl = !!(postgresUrl || databaseUrl);
const provider = hasPostgresUrl ? 'postgresql' : 'sqlite';
const url = postgresUrl || databaseUrl || localDbUrl || 'file:./prisma/dev.db';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    provider,
    url,
  },
});
