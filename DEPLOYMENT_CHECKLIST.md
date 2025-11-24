# Deployment Checklist & Process

## Problem

We deployed to production without required environment variables, causing authentication failures.

## Solution: Environment Validation Before Deployment

### 1. Required GitHub Secrets (Must be set BEFORE any deployment)

```
VERCEL_TOKEN              # Vercel authentication
VERCEL_ORG_ID             # Vercel organization
VERCEL_PROJECT_ID         # Vercel project
NEXTAUTH_SECRET           # NextAuth encryption key (min 32 chars)
NEXTAUTH_URL              # Production URL
ADMIN_SEED_TOKEN          # One-time seed endpoint token
```

**Where to set:** https://github.com/pwarnock/church-volunteer-app/settings/secrets/actions

### 2. Pre-Deployment Validation Script

Create `.github/workflows/validate-env.yml`:

```yaml
name: Validate Environment

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check required secrets
        run: |
          REQUIRED_SECRETS=(
            "VERCEL_TOKEN"
            "VERCEL_ORG_ID"
            "VERCEL_PROJECT_ID"
            "NEXTAUTH_SECRET"
            "NEXTAUTH_URL"
            "ADMIN_SEED_TOKEN"
          )

          for secret in "${REQUIRED_SECRETS[@]}"; do
            if [ -z "${!secret}" ]; then
              echo "❌ Missing required secret: $secret"
              exit 1
            fi
          done
          echo "✅ All required secrets are configured"
```

### 3. Post-Deployment Seed Script

After deployment, automatically seed the database:

```yaml
name: Post-Deploy Seed

on:
  deployment_status:
    types: [success]

jobs:
  seed:
    if: github.event.deployment.environment == 'production'
    runs-on: ubuntu-latest
    steps:
      - name: Seed production database
        run: |
          curl -X POST \
            https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app/api/admin/seed \
            -H "Authorization: Bearer ${{ secrets.ADMIN_SEED_TOKEN }}" \
            -w "\n%{http_code}\n"
```

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
- [ ] Vercel environment variables are synced via `vercel env pull`

**After production deployment:**

- [ ] Call `/api/admin/seed` endpoint to populate demo users
- [ ] Test login with: `volunteer@demo.com` / `password123`
- [ ] Verify leader dashboard works with: `leader@demo.com` / `password123`

## Why We Got Broken

1. ❌ PR #6 deployed without NEXTAUTH_SECRET/URL
2. ❌ No pre-deployment validation
3. ❌ No automated post-deploy seeding
4. ❌ No clear runbook for "production ready"

## The Fix (Prevent Future Issues)

1. ✅ Add environment validation to CI
2. ✅ Automate post-deploy seeding
3. ✅ Document required variables
4. ✅ Create rollback playbook (if needed)
5. ✅ Add smoke tests that verify auth works

## Rollback Procedure

If production breaks after deployment:

```bash
# Option 1: Revert to previous commit
git revert <bad-commit-sha>
git push origin main

# Option 2: Quick fix deploy
vercel --prod --prebuilt
```

## Next Deployment Steps

1. Verify all secrets are set ✓ (we did this)
2. Merge PR to main → auto-deploys via GitHub Actions
3. Wait for deployment to complete (~2 min)
4. Run seed endpoint (one-time)
5. Test login works
6. Done
