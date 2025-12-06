import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  // For development, use SQLite; for production, use PostgreSQL
  // Connection URLs are moved here from schema files in Prisma 7
  datasource: {
    url:
      process.env.NODE_ENV === 'production'
        ? (process.env.POSTGRES_URL as string)
        : (process.env.LOCAL_DB_URL as string) || 'file:./prisma/dev.db',
  },
});
