# Development Experience Consistency Setup

## Overview

This guide ensures consistent development experience between local development and Vercel deployment using Prisma 7.

## Environment Setup

### 1. Local Development Environment

Create `.env.local` with:

```bash
# Database - Use PostgreSQL for consistency with production
POSTGRES_URL="postgresql://username:password@localhost:5432/church_volunteer_dev"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"

# Optional: For production-like testing
# PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your-api-key"
```

### 2. Vercel Environment Variables

Already configured:

- `POSTGRES_URL` - Direct PostgreSQL connection (Development, Preview, Production)
- `PRISMA_DATABASE_URL` - Prisma Accelerate URL (Development, Preview, Production)
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - Authentication secret

## Database Setup Options

### Option A: PostgreSQL Locally (Recommended for Consistency)

1. Install PostgreSQL locally:

```bash
# Ubuntu/WSL
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows
# Download from https://postgresql.org/download/windows/
```

2. Create database:

```bash
sudo -u postgres createdb church_volunteer_dev
sudo -u postgres createuser --interactive
```

3. Update `.env.local` with connection string

### Option B: SQLite Locally (Simpler Setup)

1. Use SQLite for local development:

```bash
# .env.local
# POSTGRES_URL=""  # Leave empty to trigger SQLite fallback
```

2. SQLite database will be created automatically at `./prisma/dev.db`

## Configuration Files

### prisma.config.ts

Handles both environments automatically:

```typescript
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('POSTGRES_URL') || 'file:./prisma/dev.db',
  },
});
```

### src/lib/prisma.ts

Automatically selects appropriate adapter:

- PostgreSQL → `PrismaPg` adapter
- SQLite → `PrismaBetterSqlite3` adapter

## Development Workflow

### Initial Setup

```bash
# Install dependencies
bun install

# Generate Prisma client
bunx prisma generate

# Push schema to database
bunx prisma db push

# Seed database (optional)
bunx tsx prisma/seed.ts
```

### Daily Development

```bash
# Start development server
bun run dev

# Run tests
bun test

# Build for production
bun run build
```

## Deployment Consistency

### Local Build

```bash
# Uses POSTGRES_URL from .env.local
POSTGRES_URL="..." bun run build
```

### Vercel Build

- Automatically uses `POSTGRES_URL` from environment variables
- Prisma client generated with correct configuration
- No manual intervention required

## Troubleshooting

### Build Issues

```bash
# Clear generated files
rm -rf src/generated

# Regenerate with environment
POSTGRES_URL="..." bunx prisma generate
```

### Database Connection Issues

```bash
# Test connection
bunx prisma db push

# View database
bunx prisma studio
```

### Environment Variable Issues

```bash
# Pull latest Vercel environment variables
vercel env pull .env.local

# Check current variables
vercel env ls
```

## Key Benefits

✅ **Consistent Database**: Same PostgreSQL engine locally and production  
✅ **Automatic Adapter Selection**: No manual configuration needed  
✅ **Environment Parity**: Same variables work everywhere  
✅ **Zero Configuration**: Works out of the box  
✅ **Type Safety**: Full TypeScript support across environments

## Migration Path

If starting with SQLite and moving to PostgreSQL:

1. Set up PostgreSQL locally
2. Update `.env.local` with `POSTGRES_URL`
3. Run `bunx prisma db push`
4. No code changes required - automatic adapter selection
