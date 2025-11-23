# GitHub Actions Setup - Action Items

Your GitHub Actions workflows are now in place. Follow these steps to complete the setup.

## ✅ What's Done

- [x] Created 3 GitHub Actions workflows:
  - `ci.yml` - Runs linting, formatting checks, unit tests, E2E tests on PRs
  - `deploy.yml` - Auto-deploys to Vercel production when merging to `main`
  - `preview.yml` - Creates preview deployments for PRs and `develop` branch
- [x] Created setup guide: `GITHUB_ACTIONS_SETUP.md`
- [x] Fixed bugs blocking Vercel deploy (TypeScript error, `vercel.json` installer)

## 🔧 Next Steps (Required)

### Step 1: Get Vercel Token and IDs

```bash
# Check your IDs
cat .vercel/project.json
```

You'll need:

- `projectId` - from above
- `orgId` - from above
- **Vercel Token** - create at https://vercel.com/account/tokens

### Step 2: Add GitHub Secrets

Go to: https://github.com/pwarnock/church-volunteer-app/settings/secrets/actions

Add these 3 secrets:

- `VERCEL_TOKEN` = your token from Step 1
- `VERCEL_ORG_ID` = `team_...` value from `.vercel/project.json`
- `VERCEL_PROJECT_ID` = `prj_...` value from `.vercel/project.json`

### Step 3: Setup Branch Protection

Go to: https://github.com/pwarnock/church-volunteer-app/settings/branches

Add rule for `main` branch:

- ✅ Require a pull request before merging
  - ✅ Require 1 approval
  - ✅ Dismiss stale approvals
- ✅ Require status checks: `lint-and-test`
- ✅ Include administrators
- ✅ Restrict push access to admins only

### Step 4: Disable Local Vercel Deployments

```bash
# Remove Vercel auth token from local machine
rm ~/.vercel/auth.json

# Add this to your shell config (.zshrc, .bashrc, etc.) to prevent accidents:
alias vercel="echo '❌ Direct Vercel deployments are disabled. Use: git push to main'"
```

### Step 5: (Optional) Disable Vercel Direct Access

If you want to enforce this across the team:

1. Go to https://vercel.com/pete-warnocks-projects/church-volunteer-app/settings/integrations
2. Review connected accounts and remove personal tokens
3. Remove team members' direct Vercel project access

## 📋 Verify Setup

1. Go to: https://github.com/pwarnock/church-volunteer-app/actions
2. You should see 3 workflows listed:
   - `CI`
   - `Deploy to Production`
   - `Deploy Preview`

Test it:

1. Create a test branch: `git checkout -b test/github-actions`
2. Make a small change and push: `git push origin test/github-actions`
3. Go to Actions tab - you should see `CI` workflow running
4. Open a PR to `main`
5. Verify:
   - `CI` workflow completes (shows ✅)
   - `Deploy Preview` creates a preview URL
   - Can't merge without approval (branch protection)

## 🚀 New Deployment Flow

### For Contributors:

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and push
git add .
git commit -m "feat: description"
git push origin feature/my-feature

# Open PR on GitHub
# CI tests run automatically ✅
# Preview deploys automatically 🚀
```

### For Maintainers:

```bash
# After review and approval, merge PR
# → Main branch gets the commit
# → Production deploy runs automatically
# → App updates at production URL
```

## ❓ Troubleshooting

**Workflows don't appear in Actions tab?**

- Check `.github/workflows/` files exist in the repo
- Files are already committed and pushed

**Deploy fails with "authentication token" error?**

- Verify all 3 secrets are set in GitHub Secrets
- Check token hasn't expired at https://vercel.com/account/tokens

**Can't see workflow status checks in PR?**

- Branch protection rule may not be synced yet
- Workflows must run successfully first to appear

**Still able to deploy with local Vercel CLI?**

- Remove `.vercel/auth.json`: `rm ~/.vercel/auth.json`
- Add alias to prevent accidents (see Step 4)

## 📚 Files Created/Modified

**New files:**

- `.github/workflows/ci.yml` - Linting & testing on PRs
- `.github/workflows/deploy.yml` - Production deployment
- `.github/workflows/preview.yml` - Preview deployments
- `GITHUB_ACTIONS_SETUP.md` - Detailed setup guide
- `GITHUB_ACTIONS_TODO.md` - This file

**Fixed files:**

- `src/lib/api-enhancements.ts` - Fixed TypeScript error
- `vercel.json` - Changed to `bun install`

Ready to proceed? Start with Step 1 above!
