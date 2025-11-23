#!/usr/bin/env tsx

/**
 * GitHub Actions Setup Script
 * Automates adding GitHub Secrets and configuring branch protection
 *
 * Usage:
 *   bun scripts/setup-github-actions.ts [--vercel-token=YOUR_TOKEN] [--skip-branch-protection]
 *
 * Or with env var:
 *   VERCEL_TOKEN=xxx bun scripts/setup-github-actions.ts
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import * as readline from 'readline';
import path from 'path';

interface VercelConfig {
  projectId: string;
  orgId: string;
  projectName: string;
}

interface SetupOptions {
  vercelToken?: string;
  skipBranchProtection?: boolean;
  repo?: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

function log(
  message: string,
  type: 'info' | 'success' | 'error' | 'warn' = 'info'
) {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function execCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error}`);
  }
}

async function getVercelConfig(): Promise<VercelConfig> {
  const configPath = path.join(process.cwd(), '.vercel', 'project.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  return config;
}

async function checkGitHubCLI() {
  try {
    execCommand('gh --version');
    return true;
  } catch {
    log('GitHub CLI not found. Install from: https://cli.github.com', 'error');
    return false;
  }
}

async function getGitHubRepo(): Promise<string> {
  try {
    const remote = execCommand('git config --get remote.origin.url');
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/);
    if (match) {
      return `${match[1]}/${match[2]}`;
    }
  } catch (error) {
    log('Could not detect GitHub repo from git config', 'warn');
  }
  return '';
}

async function confirmRepo(detectedRepo: string): Promise<string> {
  let repo = detectedRepo;
  if (!repo) {
    repo = await question('Enter GitHub repository (owner/repo): ');
  } else {
    const confirm = await question(`Use repository: ${repo}? (y/n) `);
    if (confirm.toLowerCase() !== 'y') {
      repo = await question('Enter GitHub repository (owner/repo): ');
    }
  }
  return repo;
}

async function getVercelToken(): Promise<string> {
  const envToken = process.env.VERCEL_TOKEN;
  if (envToken) {
    log('Found VERCEL_TOKEN in environment', 'success');
    return envToken;
  }

  const argToken = process.argv
    .find((arg) => arg.startsWith('--vercel-token='))
    ?.split('=')[1];
  if (argToken) {
    log('Found --vercel-token argument', 'success');
    return argToken;
  }

  log(
    'No Vercel token found. Visit: https://vercel.com/account/tokens',
    'info'
  );
  const token = await question('Paste your Vercel token: ');
  if (!token) {
    throw new Error('Vercel token is required');
  }
  return token;
}

async function setGitHubSecret(repo: string, name: string, value: string) {
  log(`Setting ${name}...`, 'info');
  try {
    execCommand(`gh secret set ${name} --repo ${repo} --body "${value}"`);
    log(`✅ ${name} set successfully`, 'success');
  } catch (error) {
    log(`Failed to set ${name}`, 'error');
    throw error;
  }
}

async function verifySecrets(repo: string): Promise<boolean> {
  log('Verifying secrets...', 'info');
  try {
    const secretsList = execCommand(`gh secret list --repo ${repo}`);
    const secrets = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];
    const missing = secrets.filter((secret) => !secretsList.includes(secret));

    if (missing.length > 0) {
      log(`Missing secrets: ${missing.join(', ')}`, 'error');
      return false;
    }

    log('✅ All secrets configured correctly', 'success');
    return true;
  } catch (error) {
    log('Could not verify secrets', 'error');
    return false;
  }
}

async function setupBranchProtection(repo: string) {
  const shouldSetup = await question(
    'Setup branch protection on main branch? (requires admin access) (y/n) '
  );

  if (shouldSetup.toLowerCase() !== 'y') {
    log(
      'Skipping branch protection setup. You can do this manually at:',
      'info'
    );
    log(`https://github.com/${repo}/settings/branches`, 'info');
    return;
  }

  log('Setting up branch protection for main...', 'info');

  try {
    // Create branch protection rule
    execCommand(`gh api repos/${repo}/branches/main/protection \
      -X PUT \
      -F required_pull_request_reviews.required_approving_review_count=1 \
      -F required_pull_request_reviews.dismiss_stale_reviews=true \
      -F required_status_checks.strict=true \
      -F required_status_checks.contexts='["lint-and-test"]' \
      -F enforce_admins=true \
      -F restrict_who_can_push.user_push_restrictions='[]' \
      -F allow_force_pushes=false \
      -F allow_deletions=false`);

    log('✅ Branch protection configured successfully', 'success');
  } catch (error) {
    log(
      'Could not set branch protection. You may need to do this manually at:',
      'warn'
    );
    log(`https://github.com/${repo}/settings/branches`, 'warn');
    log('Required settings:', 'info');
    log('  - Require 1 approval before merging', 'info');
    log('  - Dismiss stale reviews', 'info');
    log('  - Require status checks: lint-and-test', 'info');
    log('  - Include administrators', 'info');
  }
}

async function main() {
  console.clear();
  log(
    '═══════════════════════════════════════════════════════════════',
    'info'
  );
  log('GitHub Actions Setup for Vercel Deployments', 'info');
  log(
    '═══════════════════════════════════════════════════════════════',
    'info'
  );
  console.log();

  try {
    // Check prerequisites
    log('Checking prerequisites...', 'info');
    const hasGitHubCLI = await checkGitHubCLI();
    if (!hasGitHubCLI) {
      process.exit(1);
    }

    // Get configuration
    log('Reading Vercel configuration...', 'info');
    const vercelConfig = await getVercelConfig();
    log(`✅ Found Vercel project: ${vercelConfig.projectName}`, 'success');

    // Get repository
    const detectedRepo = await getGitHubRepo();
    const repo = await confirmRepo(detectedRepo);
    log(`Using repository: ${repo}`, 'info');

    // Get Vercel token
    const vercelToken = await getVercelToken();

    console.log();
    log(
      '─────────────────────────────────────────────────────────────',
      'info'
    );
    log('Adding GitHub Secrets', 'info');
    log(
      '─────────────────────────────────────────────────────────────',
      'info'
    );
    console.log();

    // Set secrets
    await setGitHubSecret(repo, 'VERCEL_TOKEN', vercelToken);
    await setGitHubSecret(repo, 'VERCEL_ORG_ID', vercelConfig.orgId);
    await setGitHubSecret(repo, 'VERCEL_PROJECT_ID', vercelConfig.projectId);

    // Verify secrets
    console.log();
    const verified = await verifySecrets(repo);
    if (!verified) {
      throw new Error('Secret verification failed');
    }

    // Branch protection
    console.log();
    log(
      '─────────────────────────────────────────────────────────────',
      'info'
    );
    log('Branch Protection Configuration', 'info');
    log(
      '─────────────────────────────────────────────────────────────',
      'info'
    );
    console.log();

    if (!process.argv.includes('--skip-branch-protection')) {
      await setupBranchProtection(repo);
    }

    // Summary
    console.log();
    log(
      '═══════════════════════════════════════════════════════════════',
      'info'
    );
    log('✅ Setup Complete!', 'success');
    log(
      '═══════════════════════════════════════════════════════════════',
      'info'
    );
    console.log();
    log('Next steps:', 'info');
    log(
      '1. Verify workflows in Actions tab: https://github.com/' +
        repo +
        '/actions',
      'info'
    );
    log('2. Create a test PR to verify CI runs', 'info');
    log('3. Review and merge to main to test production deployment', 'info');
    console.log();

    rl.close();
    process.exit(0);
  } catch (error) {
    log(
      `Setup failed: ${error instanceof Error ? error.message : String(error)}`,
      'error'
    );
    rl.close();
    process.exit(1);
  }
}

main();
