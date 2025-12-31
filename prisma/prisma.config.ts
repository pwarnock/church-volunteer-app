import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// For local migrations, always use SQLite unless USE_POSTGRES is explicitly set
// This prevents accidentally running migrations against production
const usePostgres = process.env.USE_POSTGRES === 'true' && process.env.POSTGRES_URL;

export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
  },
  datasource: {
    url: usePostgres ? process.env.POSTGRES_URL! : 'file:./dev.db',
  },
});
