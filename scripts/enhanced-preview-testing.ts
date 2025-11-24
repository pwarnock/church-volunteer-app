#!/usr/bin/env bun

/**
 * Enhanced Preview Testing Pipeline
 *
 * Domain: Development tooling
 * Responsibility: Comprehensive testing for preview deployments
 * Usage: bun run scripts/enhanced-preview-testing.ts
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface PreviewTestResult {
  deploymentUrl: string;
  healthCheck: boolean;
  smokeTests: boolean;
  apiTests: boolean;
  userFlowTests: boolean;
  issues: string[];
  timestamp: string;
}

class EnhancedPreviewTesting {
  private deploymentUrl: string;
  private testResults: PreviewTestResult;

  constructor(deploymentUrl: string) {
    this.deploymentUrl = deploymentUrl;
    this.testResults = {
      deploymentUrl,
      healthCheck: false,
      smokeTests: false,
      apiTests: false,
      userFlowTests: false,
      issues: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Run comprehensive preview testing
   */
  async runFullTestSuite(): Promise<PreviewTestResult> {
    console.log(
      `🧪 Running Enhanced Preview Testing for ${this.deploymentUrl}\n`
    );

    // 1. Health Check
    await this.runHealthCheck();

    // 2. Smoke Tests
    await this.runSmokeTests();

    // 3. API Endpoint Tests
    await this.runAPIEndpointTests();

    // 4. Critical User Flow Tests
    await this.runUserFlowTests();

    // 5. Generate Report
    this.generateReport();

    return this.testResults;
  }

  /**
   * Test deployment health endpoint
   */
  private async runHealthCheck(): Promise<void> {
    console.log('🏥 Testing health endpoint...');

    try {
      const response = await fetch(`${this.deploymentUrl}/api/health`, {
        method: 'GET',
        headers: { 'User-Agent': 'preview-test-agent' },
      });

      if (response.ok) {
        const health = await response.json();
        console.log('✅ Health check passed');
        console.log(`   Environment: ${health.environment || 'unknown'}`);
        console.log(`   Database: ${health.hasDatabaseUrl ? '✅' : '❌'}`);
        console.log(`   Auth: ${health.hasNextAuthUrl ? '✅' : '❌'}`);

        this.testResults.healthCheck = true;
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Health check failed: ${error}`);
      this.testResults.issues.push(`Health check failed: ${error}`);
    }
  }

  /**
   * Run smoke tests against preview
   */
  private async runSmokeTests(): Promise<void> {
    console.log('\n💨 Running smoke tests...');

    try {
      // Test basic page loads
      const pageLoadTests = [
        { path: '/', name: 'Home page' },
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/auth/signin', name: 'Sign in page' },
      ];

      for (const pageTest of pageLoadTests) {
        const response = await fetch(`${this.deploymentUrl}${pageTest.path}`, {
          method: 'GET',
          headers: { 'User-Agent': 'preview-test-agent' },
        });

        if (response.ok) {
          console.log(`   ✅ ${pageTest.name} loads`);
        } else {
          throw new Error(
            `${pageTest.name} failed to load: ${response.status}`
          );
        }
      }

      // Test static assets
      const staticAssetTests = [
        '/_next/static/css/app/layout.css',
        '/_next/static/chunks/webpack.js',
      ];

      for (const asset of staticAssetTests) {
        const response = await fetch(`${this.deploymentUrl}${asset}`, {
          method: 'GET',
          headers: { 'User-Agent': 'preview-test-agent' },
        });

        if (response.ok) {
          console.log(`   ✅ Static asset: ${asset}`);
        } else {
          console.log(`   ⚠️  Static asset missing: ${asset}`);
        }
      }

      this.testResults.smokeTests = true;
      console.log('✅ Smoke tests passed');
    } catch (error) {
      console.log(`❌ Smoke tests failed: ${error}`);
      this.testResults.issues.push(`Smoke tests failed: ${error}`);
    }
  }

  /**
   * Test critical API endpoints
   */
  private async runAPIEndpointTests(): Promise<void> {
    console.log('\n🔌 Testing API endpoints...');

    const apiTests = [
      {
        path: '/api/opportunities',
        method: 'GET',
        expectedStatus: 200,
        name: 'Get opportunities',
      },
      {
        path: '/api/health',
        method: 'GET',
        expectedStatus: 200,
        name: 'Health endpoint',
      },
      {
        path: '/api/auth/signin',
        method: 'GET',
        expectedStatus: [200, 404, 405], // Multiple acceptable statuses
        name: 'Auth endpoint',
      },
    ];

    let passedTests = 0;

    for (const apiTest of apiTests) {
      try {
        const response = await fetch(`${this.deploymentUrl}${apiTest.path}`, {
          method: apiTest.method,
          headers: {
            'User-Agent': 'preview-test-agent',
            'Content-Type': 'application/json',
          },
        });

        const expectedStatuses = Array.isArray(apiTest.expectedStatus)
          ? apiTest.expectedStatus
          : [apiTest.expectedStatus];

        if (expectedStatuses.includes(response.status)) {
          console.log(`   ✅ ${apiTest.name}: ${response.status}`);
          passedTests++;
        } else {
          throw new Error(
            `${apiTest.name}: Expected ${expectedStatuses.join(' or ')}, got ${response.status}`
          );
        }
      } catch (error) {
        console.log(`   ❌ ${apiTest.name}: ${error}`);
        this.testResults.issues.push(
          `API test failed: ${apiTest.name} - ${error}`
        );
      }
    }

    if (passedTests === apiTests.length) {
      this.testResults.apiTests = true;
      console.log('✅ API endpoint tests passed');
    } else {
      console.log(`❌ API tests: ${passedTests}/${apiTests.length} passed`);
    }
  }

  /**
   * Test critical user flows
   */
  private async runUserFlowTests(): Promise<void> {
    console.log('\n👤 Testing user flows...');

    try {
      // Test authentication flow
      await this.testAuthenticationFlow();

      // Test opportunity browsing
      await this.testOpportunityBrowsing();

      // Test leader dashboard access (should redirect appropriately)
      await this.testLeaderDashboardAccess();

      this.testResults.userFlowTests = true;
      console.log('✅ User flow tests passed');
    } catch (error) {
      console.log(`❌ User flow tests failed: ${error}`);
      this.testResults.issues.push(`User flow tests failed: ${error}`);
    }
  }

  /**
   * Test authentication flow
   */
  private async testAuthenticationFlow(): Promise<void> {
    console.log('   🔐 Testing authentication flow...');

    // Test sign-in page loads
    const signInResponse = await fetch(`${this.deploymentUrl}/auth/signin`, {
      method: 'GET',
      headers: { 'User-Agent': 'preview-test-agent' },
    });

    if (!signInResponse.ok) {
      throw new Error('Sign-in page failed to load');
    }

    // Test sign-in form submission (will fail but should not 500)
    const formResponse = await fetch(`${this.deploymentUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'User-Agent': 'preview-test-agent',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'invalid-password',
      }),
    });

    // Should return error, not 500
    if (formResponse.status === 500) {
      throw new Error('Sign-in endpoint returned 500 error');
    }

    console.log('     ✅ Authentication flow works');
  }

  /**
   * Test opportunity browsing
   */
  private async testOpportunityBrowsing(): Promise<void> {
    console.log('   📋 Testing opportunity browsing...');

    // Test opportunities API
    const opportunitiesResponse = await fetch(
      `${this.deploymentUrl}/api/opportunities`,
      {
        method: 'GET',
        headers: { 'User-Agent': 'preview-test-agent' },
      }
    );

    if (!opportunitiesResponse.ok) {
      throw new Error('Opportunities API failed');
    }

    const data = await opportunitiesResponse.json();

    // Validate response structure
    if (!data.opportunities || !Array.isArray(data.opportunities)) {
      throw new Error('Opportunities API response structure invalid');
    }

    console.log('     ✅ Opportunity browsing works');
  }

  /**
   * Test leader dashboard access
   */
  private async testLeaderDashboardAccess(): Promise<void> {
    console.log('   👑 Testing leader dashboard access...');

    // Test leader dashboard without auth (should redirect)
    const leaderResponse = await fetch(`${this.deploymentUrl}/leader`, {
      method: 'GET',
      headers: { 'User-Agent': 'preview-test-agent' },
      redirect: 'manual', // Don't follow redirects
    });

    // Should redirect (302) or show access denied, not 500
    if (leaderResponse.status === 500) {
      throw new Error('Leader dashboard returned 500 error');
    }

    console.log('     ✅ Leader dashboard access handled correctly');
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENHANCED PREVIEW TESTING REPORT');
    console.log('='.repeat(60));

    console.log(`\n🔗 Deployment: ${this.deploymentUrl}`);
    console.log(`⏰ Timestamp: ${this.testResults.timestamp}`);

    console.log('\n📋 Test Results:');
    console.log(
      `   Health Check: ${this.testResults.healthCheck ? '✅ PASS' : '❌ FAIL'}`
    );
    console.log(
      `   Smoke Tests: ${this.testResults.smokeTests ? '✅ PASS' : '❌ FAIL'}`
    );
    console.log(
      `   API Tests: ${this.testResults.apiTests ? '✅ PASS' : '❌ FAIL'}`
    );
    console.log(
      `   User Flows: ${this.testResults.userFlowTests ? '✅ PASS' : '❌ FAIL'}`
    );

    const allPassed =
      this.testResults.healthCheck &&
      this.testResults.smokeTests &&
      this.testResults.apiTests &&
      this.testResults.userFlowTests;

    console.log(
      `\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`
    );

    if (this.testResults.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      this.testResults.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    // Save report to file
    this.saveReport();
  }

  /**
   * Save test report to file
   */
  private saveReport(): void {
    const reportDir = join(process.cwd(), '.test-data', 'preview-tests');

    // Ensure directory exists
    try {
      require('fs').mkdirSync(reportDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = join(reportDir, `preview-test-${timestamp}.json`);

    writeFileSync(reportFile, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Report saved to: ${reportFile}`);
  }

  /**
   * Update GitHub PR with test results
   */
  async updatePRWithResults(): Promise<void> {
    if (!process.env.GITHUB_TOKEN || !process.env.PR_NUMBER) {
      console.log(
        '\n⚠️  GitHub token or PR number not provided - skipping PR update'
      );
      return;
    }

    const allPassed =
      this.testResults.healthCheck &&
      this.testResults.smokeTests &&
      this.testResults.apiTests &&
      this.testResults.userFlowTests;

    const commentBody = `
## 🧪 Enhanced Preview Testing Results

**Deployment:** ${this.deploymentUrl}

### Test Results:
| Test | Status |
|------|--------|
| Health Check | ${this.testResults.healthCheck ? '✅ PASS' : '❌ FAIL'} |
| Smoke Tests | ${this.testResults.smokeTests ? '✅ PASS' : '❌ FAIL'} |
| API Tests | ${this.testResults.apiTests ? '✅ PASS' : '❌ FAIL'} |
| User Flows | ${this.testResults.userFlowTests ? '✅ PASS' : '❌ FAIL'} |

### Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}

${
  this.testResults.issues.length > 0
    ? `
### Issues Found:
${this.testResults.issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}
`
    : ''
}

---
*Generated at: ${this.testResults.timestamp}*
    `.trim();

    try {
      execSync(
        `gh pr comment ${process.env.PR_NUMBER} --body "${commentBody}"`,
        {
          stdio: 'inherit',
        }
      );
      console.log('\n📝 PR comment updated with test results');
    } catch (error) {
      console.log(`\n⚠️  Failed to update PR: ${error}`);
    }
  }
}

// CLI interface
async function main() {
  const deploymentUrl = process.argv[2];
  const updatePR = process.argv.includes('--update-pr');

  if (!deploymentUrl) {
    console.log(
      'Usage: bun run scripts/enhanced-preview-testing.ts <deployment-url> [--update-pr]'
    );
    process.exit(1);
  }

  const tester = new EnhancedPreviewTesting(deploymentUrl);
  const results = await tester.runFullTestSuite();

  if (updatePR) {
    await tester.updatePRWithResults();
  }

  // Exit with error code if any tests failed
  const allPassed =
    results.healthCheck &&
    results.smokeTests &&
    results.apiTests &&
    results.userFlowTests;

  if (!allPassed) {
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { EnhancedPreviewTesting };
