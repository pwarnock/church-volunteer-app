/**
 * Smoke Test Script
 *
 * Domain: Production deployment verification
 * Responsibility: Run smoke tests against production after deployment
 * Usage: bun run test:smoke
 */

import { execSync } from 'child_process';

const PROD_URL = process.env.PROD_URL;

if (!PROD_URL) {
  console.error('❌ PROD_URL environment variable is required');
  process.exit(1);
}

async function runSmokeTests() {
  console.log('🚀 Running production smoke tests...');
  console.log(`📍 Target: ${PROD_URL}`);

  try {
    // Check if production is accessible
    const response = await fetch(`${PROD_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`Production health check failed: ${response.status}`);
    }

    const health = await response.json();
    console.log('✅ Production health check passed');
    console.log(`   Environment: ${health.environment}`);
    console.log(`   Database: ${health.hasDatabaseUrl ? '✅' : '❌'}`);
    console.log(`   Auth: ${health.hasNextAuthUrl ? '✅' : '❌'}`);

    // Run Playwright smoke tests
    console.log('🧪 Running E2E smoke tests...');

    const smokeTestCommand = `PLAYWRIGHT_TEST_BASE_URL="${PROD_URL}" bunx playwright test e2e/smoke.spec.ts --reporter=list`;

    execSync(smokeTestCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('✅ All smoke tests passed!');
    console.log('🎉 Production deployment verified successfully');
  } catch (error) {
    console.error('❌ Smoke tests failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runSmokeTests();
}

export { runSmokeTests };
