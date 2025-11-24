# Deployment Checklist & Process

## Problem We Had

Deployed to production without required environment variables (NEXTAUTH_SECRET, NEXTAUTH_URL), causing authentication failures.

## Solution: Environment Validation Before Deployment

### 1. Required GitHub Secrets (Set BEFORE any deployment)

```
VERCEL_TOKEN              # Vercel authentication
VERCEL_ORG_ID             # Vercel organization
VERCEL_PROJECT_ID         # Vercel project
NEXTAUTH_SECRET           # NextAuth encryption key (min 32 chars)
NEXTAUTH_URL              # Production URL
```

**Where to set:** https://github.com/pwarnock/church-volunteer-app/settings/secrets/actions

### 2. Pre-Deployment Validation (Automated in CI)

File: `.github/workflows/validate-secrets.yml`

Validates that all required secrets exist before allowing deployment.

### 3. Database Seeding (One-time Setup)

**Initial setup (after first production deployment):**

```bash
# Pull production environment
vercel env pull

# Seed the database
bunx prisma db seed
```

This is a **one-time operation**. After initial seeding:

- Demo users exist in production
- Data persists across future deployments
- No further seeding needed (Vercel Postgres is persistent)

### 4. Local Development Setup

New developers should run:

```bash
# 1. Install dependencies
bun install

# 2. Create local env
cp .env.example .env.local

# 3. Seed local database
bunx tsx prisma/seed.ts

# 4. Start dev server
bun run dev
```

### 5. Vercel Dashboard Checklist

**Before merging to main:**

- [ ] All GitHub Secrets are set (see step 1)
- [ ] NEXTAUTH_SECRET is at least 32 characters
- [ ] NEXTAUTH_URL matches production domain exactly

**After first production deployment (one-time):**

- [ ] Pull production env: `vercel env pull`
- [ ] Seed database: `bunx prisma db seed`
- [ ] Test login: `volunteer@demo.com` / `password123`
- [ ] Verify leader dashboard: `leader@demo.com` / `password123`

## Why We Got Broken

1. ❌ PR #6 deployed without NEXTAUTH_SECRET/URL
2. ❌ No validation to prevent this
3. ❌ No clear seeding documentation

## Prevention (What We Fixed)

1. ✅ CI validates all secrets before deployment (`.github/workflows/validate-secrets.yml`)
2. ✅ Clear one-time setup instructions (this document)
3. ✅ Local seeding works the same way as production

## Deployment Flow

```
1. Create PR → CI validates secrets exist
2. Get approval → Merge to main
3. Auto-deploy to production via GitHub Actions
4. (First time only) Seed database: bunx prisma db seed
5. Done - future deployments need no seeding
```

## Rollback

If production breaks:

```bash
# Revert to previous commit
git revert <bad-commit-sha>
git push origin main
# Auto-deploys again
```

## Files

- `.github/workflows/validate-secrets.yml` - CI validation
- `prisma/seed.ts` - Demo data definition
- `SETUP_GUIDE.md` - Developer onboarding
