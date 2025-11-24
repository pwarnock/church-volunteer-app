# Setup Guide

## Quick Start (Local Development)

```bash
# 1. Install dependencies
bun install

# 2. Create environment file
cp .env.example .env.local

# 3. Seed local database with demo data
bunx tsx prisma/seed.ts

# 4. Start development server
bun run dev
```

**Demo Credentials (Local):**

- Email: `volunteer@demo.com` | Password: `password123`
- Email: `leader@demo.com` | Password: `password123`

## Production Deployment

### First-Time Setup (One-time, before first deployment)

1. **Set GitHub Secrets** (https://github.com/pwarnock/church-volunteer-app/settings/secrets/actions)

   Required secrets:
   - `VERCEL_TOKEN` - Create at https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - From `.vercel/project.json`
   - `VERCEL_PROJECT_ID` - From `.vercel/project.json`
   - `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Production URL: `https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app`

2. **Verify Secrets**
   ```bash
   # CI will validate all secrets on next PR
   ```

### Deployment Workflow (Every deployment)

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and push
git push origin feature/my-feature

# 3. Open PR → GitHub Actions runs CI ✅
#    (validates secrets exist)

# 4. Get approved and merge → GitHub Actions deploys to production ✅
```

### Initial Production Seed (First time only, after first deployment)

After the first successful deployment:

```bash
# Pull production environment variables
vercel env pull

# Seed the production database with demo users
bunx prisma db seed
```

This is a **one-time operation**. After this:

- Demo users exist permanently in production database
- Vercel Postgres is persistent (not ephemeral)
- No re-seeding needed on future deployments
- Real user data accumulates over time

## Troubleshooting

### Login returns 500

- Check NEXTAUTH_SECRET is set in Vercel: `vercel env pull`
- Check NEXTAUTH_URL matches your domain
- Verify database was seeded: `bunx prisma db seed`

### Database errors

- Verify Vercel Postgres is connected: `vercel env pull`
- Check `PRISMA_DATABASE_URL` is set
- Run `bunx prisma db push` to sync schema

### Preview deployment fails

- Check bun is being used (not npm): `vercel.json` has `"installCommand": "bun install"`
- Verify all required env vars are in Vercel

## File Structure

```
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Utilities (auth, prisma, etc)
│   └── pages/api/         # API routes (legacy)
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data definition
├── .github/workflows/
│   ├── ci.yml             # Lint + test on PRs
│   ├── deploy.yml         # Deploy to production
│   ├── preview.yml        # Deploy preview
│   └── validate-secrets.yml    # Check required env vars
└── .env.example           # Environment template
```

## Common Tasks

### Add a new environment variable

1. Add to `.env.example`
2. If it's sensitive: Add to GitHub Secrets
3. Vercel will use it automatically on next deploy

### Reset local database

```bash
rm prisma/dev.db
bunx prisma generate
bunx tsx prisma/seed.ts
```

### Rollback to previous deployment

```bash
# Via GitHub
git revert <commit-sha>
git push origin main

# Via Vercel CLI
vercel rollback
```

### View production logs

```bash
vercel logs <deployment-url>
```
