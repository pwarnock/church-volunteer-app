# GitHub Actions Setup Guide

This guide walks you through enabling automated deployments via GitHub Actions to replace direct Vercel CLI access.

## Step 1: Create Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create"
3. Name it: `GitHub Actions`
4. Select scope: **Full Account**
5. Copy the token (save it temporarily)

## Step 2: Get Vercel IDs

Run this command in the project:

```bash
cat .vercel/project.json
```

You'll see:

```json
{
  "projectId": "prj_...",
  "orgId": "team_...",
  "projectName": "church-volunteer-app"
}
```

Save these values.

## Step 3: Add GitHub Secrets

1. Go to https://github.com/pwarnock/church-volunteer-app/settings/secrets/actions
2. Click "New repository secret" for each:

| Name                | Value                                       |
| ------------------- | ------------------------------------------- |
| `VERCEL_TOKEN`      | Your Vercel token from Step 1               |
| `VERCEL_ORG_ID`     | The `orgId` from `.vercel/project.json`     |
| `VERCEL_PROJECT_ID` | The `projectId` from `.vercel/project.json` |

## Step 4: Push Workflow Files

The workflow files have been created but need a token with `workflow` scope to push. Either:

**Option A: Use GitHub CLI (recommended)**

```bash
gh auth login
# Select "HTTPS" and "web browser" to authenticate
gh auth refresh -s workflow
git push
```

**Option B: Use Personal Access Token**

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `GitHub Actions Setup`
4. Select scopes: `repo`, `workflow`
5. Generate and copy token
6. Run: `git push https://<TOKEN>@github.com/pwarnock/church-volunteer-app.git`

**Option C: Manual upload**

1. Go to https://github.com/pwarnock/church-volunteer-app/new/main/.github/workflows
2. Copy contents of:
   - `.github/workflows/ci.yml`
   - `.github/workflows/deploy.yml`
   - `.github/workflows/preview.yml`
3. Create each file manually in the web interface

## Step 5: Setup Branch Protection Rules

1. Go to https://github.com/pwarnock/church-volunteer-app/settings/branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Enable:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals (set to 1)
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - Search and select: `lint-and-test` (from ci.yml)
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Include administrators** (to apply rules to you too)
   - ✅ **Restrict who can push to matching branches**
     - Only allow admins/yourself

## Step 6: Revoke Vercel Direct Access

1. Go to https://vercel.com/pete-warnocks-projects/church-volunteer-app/settings/integrations
2. Remove any personal/local Vercel CLI tokens
3. In Vercel project, remove dev team members' direct access

Locally:

```bash
# Remove Vercel auth
rm ~/.vercel/auth.json

# Prevent accidental deploys
alias vercel="echo 'Use GitHub Actions instead. Push to main branch.'"
```

## Workflow Overview

### CI Workflow (ci.yml)

- **Trigger**: PR to main/develop, or push to develop
- **Runs**: Lint, format check, unit tests, E2E tests
- **Result**: ✅ Green check = PR ready to review

### Preview Workflow (preview.yml)

- **Trigger**: PR to main/develop, or push to develop
- **Runs**: Deploys preview to Vercel
- **Result**: Preview URL available for testing

### Production Deployment (deploy.yml)

- **Trigger**: Push to main (after PR approval)
- **Runs**: Tests → Deploy to production
- **Result**: Live at https://church-volunteer-app-pete-warnocks-projects.vercel.app

## Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push to GitHub: `git push origin feature/my-feature`
4. Open PR to `main`
5. **CI runs automatically** - wait for ✅ all checks pass
6. **Preview deploys automatically** - test at preview URL
7. Request review and get approval
8. Merge to `main` → **Production deploys automatically**

## Troubleshooting

### Workflow doesn't show in Actions tab

- Workflows must be in `main` branch to be active
- Make sure files are in `.github/workflows/` directory

### Deploy fails with auth error

- Check that `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` are set in GitHub Secrets
- Verify the Vercel token hasn't expired

### Can't push workflow files

- Use GitHub CLI or Personal Access Token with `workflow` scope (see Step 4)

### "refusing to allow an OAuth App" error

- Your current auth method doesn't have workflow permissions
- Follow Option B or C in Step 4
