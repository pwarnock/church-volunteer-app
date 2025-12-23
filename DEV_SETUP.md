# Development Setup Guide

This guide helps you set up the Church Volunteer Connect project for development on any machine without code changes.

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd church-volunteer-app

# Install dependencies
bun install

# Setup database (works automatically for your environment)
bun run setup:db

# Start development server
bun run dev
```

## One-Time Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

The project uses environment-specific configuration that works out of the box:

- **Development**: SQLite (local file, no setup required)
- **Production**: PostgreSQL (via Vercel, configured automatically)

The first time you run `bun run setup:db`, it will:

- Create `.env.local` from the template if it doesn't exist
- Use SQLite for local development by default
- Generate the Prisma client
- Seed the database with demo data

### 3. Database Setup

```bash
# Automatic setup - detects environment and configures accordingly
bun run setup:db

# Or manual steps:
bunx prisma generate     # Generate client
bunx prisma db push       # Sync schema
bunx tsx prisma/seed-local.ts  # Seed local data
```

## Development Workflow

### Daily Development

```bash
# Start the development server
bun run dev

# Run tests
bun test

# Lint and format code
bun run lint:fix
bun run format

# Type checking
bun tsc --noEmit
```

### Testing

```bash
# Unit tests
bun test:unit

# Integration tests
bun test:integration

# E2E tests
bun test:e2e

# BDD tests
bun test:bdd
```

## Demo Accounts

After database setup, you can use these accounts:

- **Volunteer**: volunteer@demo.com / password123
- **Ministry Leader**: leader@demo.com / password123
- **Second Volunteer**: mike@demo.com / password123

## Environment Variables

The project includes a `.env.template` file with sensible defaults:

```bash
# Copy to .env.local if you want to customize
cp .env.template .env.local
```

Key variables:

- `NODE_ENV`: development (default) or production
- `LOCAL_DB_URL`: SQLite path for development
- `NEXTAUTH_URL`: http://localhost:3000 (development) or production URL
- `NEXTAUTH_SECRET`: Random string for session security

## Production Deployment

Production uses Vercel with:

- PostgreSQL database (via Vercel Postgres)
- Environment variables configured in Vercel dashboard
- Automatic deployments from main branch

No code changes required - the same codebase works in both environments.

## Schema Management

The project uses environment-specific schema files:

- `prisma/schema-local.prisma`: For SQLite development
- `prisma/schema-prod.prisma`: For PostgreSQL production
- `prisma/schema.prisma`: Active schema (copied from appropriate environment file)

The setup script automatically selects the correct schema file for your environment.

## Troubleshooting

### Database Issues

```bash
# Reset local database
rm -f prisma/dev.db
bun run setup:db
```

### Missing Dependencies

```bash
# Reinstall everything
rm -rf node_modules bun.lock
bun install
```

### Prisma Issues

```bash
# Regenerate client
bunx prisma generate

# Resync schema
bunx prisma db push
```

## Architecture Notes

- **Multi-environment support**: Same codebase works locally and in production
- **Database adapters**: Automatically uses SQLite locally, PostgreSQL in production
- **Type safety**: Prisma generates types for both database providers
- **Zero setup**: New contributors can run `bun run setup:db && bun run dev` immediately

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun test`
5. Submit a pull request

All development happens against SQLite local databases. Production updates are handled automatically via Vercel deployments.
