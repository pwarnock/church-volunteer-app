import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Determine provider and URL based on environment
const isProduction = process.env.NODE_ENV === 'production';
const hasPostgresUrl = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);

const provider = hasPostgresUrl ? 'postgresql' : 'sqlite';
const url = hasPostgresUrl
  ? (process.env.POSTGRES_URL || process.env.DATABASE_URL)
  : (process.env.LOCAL_DB_URL || 'file:./prisma/dev.db');

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    provider,
    url,
  },
});
