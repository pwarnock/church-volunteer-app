#!/usr/bin/env bun

/**
 * Deployment Guardrails
 *
 * Domain: Deployment safety
 * Responsibility: Prevent cowboy deployments and enforce development philosophy
 * Usage: bun run scripts/deployment-guardrails.ts
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface GuardrailResult {
  passed: boolean;
  blockers: string[];
  warnings: string[];
}

class DeploymentGuardrails {
  private projectRoot = process.cwd();

  /**
   * Run all guardrails before allowing deployment
   */
  async runGuardrails(): Promise<GuardrailResult> {
    console.log('🚪 Running Deployment Guardrails...\n');

    const result: GuardrailResult = {
      passed: true,
      blockers: [],
      warnings: [],
    };

    // Critical guardrails - will block deployment
    await this.checkContractFirstCompliance(result);
    await this.checkAPIValidation(result);
    await this.checkTestCoverage(result);
    await this.checkDatabaseSchema(result);
    await this.checkEnvironmentVariables(result);

    // Warning guardrails - will warn but not block
    await this.checkCodeQuality(result);
    await this.checkDocumentation(result);
    await this.checkSecurity(result);

    this.generateReport(result);

    return result;
  }

  /**
   * Check contract-first compliance
   */
  private async checkContractFirstCompliance(
    result: GuardrailResult
  ): Promise<void> {
    console.log('📋 Checking contract-first compliance...');

    const contractsDir = join(this.projectRoot, 'contracts/api');

    if (!existsSync(contractsDir)) {
      result.blockers.push(
        '❌ No contracts directory found - contract-first development required'
      );
      return;
    }

    try {
      const contracts = JSON.parse(
        readFileSync(join(contractsDir, 'index.json'), 'utf8')
      );

      if (!contracts.contracts || contracts.contracts.length === 0) {
        result.blockers.push(
          '❌ No API contracts defined - contract-first development required'
        );
        return;
      }

      console.log('   ✅ API contracts found');
    } catch (error) {
      result.blockers.push(
        '❌ Invalid contracts format - run `bun run contract:init`'
      );
    }
  }

  /**
   * Check API validation passes
   */
  private async checkAPIValidation(result: GuardrailResult): Promise<void> {
    console.log('🔍 Checking API validation...');

    try {
      execSync('bun run validate:api', {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });
      console.log('   ✅ API validation passed');
    } catch (error) {
      result.blockers.push(
        '❌ API validation failed - fix API dependencies before deployment'
      );
    }
  }

  /**
   * Check test coverage
   */
  private async checkTestCoverage(result: GuardrailResult): Promise<void> {
    console.log('🧪 Checking test coverage...');

    try {
      // Run unit tests only (exclude E2E)
      execSync('bun test src --run', {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });

      console.log('   ✅ Unit tests pass');

      // Check for critical E2E tests
      const e2eTestFiles = [
        'e2e/smoke.spec.ts',
        'e2e/auth.spec.ts',
        'e2e/opportunities.spec.ts',
      ];

      const missingTests = e2eTestFiles.filter(
        (file) => !existsSync(join(this.projectRoot, file))
      );

      if (missingTests.length > 0) {
        result.warnings.push(
          `⚠️  Missing E2E tests: ${missingTests.join(', ')}`
        );
      } else {
        console.log('   ✅ Critical E2E tests present');
      }
    } catch (error) {
      result.blockers.push('❌ Tests failing - fix tests before deployment');
    }
  }

  /**
   * Check database schema is up to date
   */
  private async checkDatabaseSchema(result: GuardrailResult): Promise<void> {
    console.log('🗄️  Checking database schema...');

    try {
      execSync('bunx prisma generate', {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });

      console.log('   ✅ Database schema generated');
    } catch (error) {
      result.blockers.push(
        '❌ Database schema issues - run `bunx prisma db push`'
      );
    }
  }

  /**
   * Check environment variables
   */
  private async checkEnvironmentVariables(
    result: GuardrailResult
  ): Promise<void> {
    console.log('🔧 Checking environment variables...');

    const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      result.blockers.push(
        `❌ Missing environment variables: ${missingVars.join(', ')}`
      );
    } else {
      console.log('   ✅ Required environment variables present');
    }
  }

  /**
   * Check code quality
   */
  private async checkCodeQuality(result: GuardrailResult): Promise<void> {
    console.log('📝 Checking code quality...');

    try {
      // Check linting
      execSync('bun run lint', {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });

      console.log('   ✅ Code passes linting');
    } catch (error) {
      result.warnings.push(
        '⚠️  Code has linting issues - consider fixing before deployment'
      );
    }

    try {
      // Check formatting
      execSync('bun run format:check', {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });

      console.log('   ✅ Code is properly formatted');
    } catch (error) {
      result.warnings.push(
        '⚠️  Code formatting issues - run `bun run format:fix`'
      );
    }
  }

  /**
   * Check documentation
   */
  private async checkDocumentation(result: GuardrailResult): Promise<void> {
    console.log('📚 Checking documentation...');

    const requiredDocs = [
      'README.md',
      'DEVELOPMENT_PHILOSOPHY.md',
      'AGENTS.md',
    ];

    const missingDocs = requiredDocs.filter(
      (doc) => !existsSync(join(this.projectRoot, doc))
    );

    if (missingDocs.length > 0) {
      result.warnings.push(
        `⚠️  Missing documentation: ${missingDocs.join(', ')}`
      );
    } else {
      console.log('   ✅ Documentation present');
    }
  }

  /**
   * Check security
   */
  private async checkSecurity(result: GuardrailResult): Promise<void> {
    console.log('🔒 Checking security...');

    try {
      // Check for secrets in code
      const grepResult = execSync(
        'git grep -i "password\\|secret\\|key" -- :!package-lock.json -- :!.env* || true',
        {
          stdio: 'pipe',
          cwd: this.projectRoot,
        }
      );

      if (grepResult && grepResult.toString().trim()) {
        result.blockers.push(
          '❌ Potential secrets found in code - remove before deployment'
        );
      } else {
        console.log('   ✅ No obvious secrets in code');
      }
    } catch (error) {
      console.log('   ⚠️  Could not check for secrets');
    }
  }

  /**
   * Generate guardrails report
   */
  private generateReport(result: GuardrailResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('🚪 DEPLOYMENT GUARDRAILS REPORT');
    console.log('='.repeat(60));

    if (result.blockers.length > 0) {
      console.log('\n🚫 DEPLOYMENT BLOCKED');
      console.log('\n❌ Critical Issues (Must Fix):');
      result.blockers.forEach((blocker, index) => {
        console.log(`   ${index + 1}. ${blocker}`);
      });

      console.log('\n🔧 To Fix:');
      console.log(
        '   1. Run contract-first development: bun run contract:init'
      );
      console.log('   2. Fix API dependencies: bun run validate:api');
      console.log('   3. Ensure tests pass: bun test');
      console.log('   4. Update database: bunx prisma db push');
      console.log('   5. Set environment variables');
    }

    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings (Recommended):');
      result.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    if (result.blockers.length === 0) {
      console.log('\n✅ DEPLOYMENT APPROVED');
      console.log('   All guardrails passed - you may proceed with deployment');
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Pre-commit hook integration
   */
  static async preCommitCheck(): Promise<void> {
    console.log('🪝 Pre-commit Guardrails Check\n');

    const guardrails = new DeploymentGuardrails();
    const result = await guardrails.runGuardrails();

    if (!result.passed) {
      console.log('\n❌ Commit blocked - fix issues and try again');
      process.exit(1);
    }

    console.log('\n✅ Commit approved');
  }

  /**
   * Run post-deployment verification
   */
  async runPostDeployment(): Promise<void> {
    console.log('🚀 Running post-deployment verification...');

    // Get production URL from Vercel
    const prodUrl = this.getProductionUrl();

    if (!prodUrl) {
      console.log('❌ Could not determine production URL');
      process.exit(1);
    }

    console.log(`📍 Target: ${prodUrl}`);

    // Run smoke tests against production
    await this.runSmokeTests(prodUrl);

    console.log('\n✅ Post-deployment verification passed');
  }

  /**
   * Get production URL from Vercel
   */
  private getProductionUrl(): string | null {
    try {
      const output = execSync('vercel ls --scope pete-warnocks-projects', {
        encoding: 'utf8',
        cwd: this.projectRoot,
      });

      const lines = output.split('\n');
      for (const line of lines) {
        if (
          line.includes('church-volunteer-app') &&
          line.includes('Production')
        ) {
          const match = line.match(/https:\/\/[^s]+\.vercel\.app/);
          if (match) {
            return match[0];
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting production URL:', error);
      return null;
    }
  }

  /**
   * Run smoke tests against production
   */
  private async runSmokeTests(prodUrl: string): Promise<void> {
    console.log('💨 Running smoke tests...');

    try {
      // Health check
      const healthResponse = await fetch(`${prodUrl}/api/health`);
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      console.log('   ✅ Health check passed');

      // Run E2E smoke tests
      const smokeCommand = `PLAYWRIGHT_TEST_BASE_URL="${prodUrl}" bunx playwright test e2e/smoke.spec.ts --reporter=list`;
      execSync(smokeCommand, {
        stdio: 'pipe',
        cwd: this.projectRoot,
      });
      console.log('   ✅ E2E smoke tests passed');
    } catch (error) {
      console.error('❌ Smoke tests failed:', error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'check':
      const guardrails = new DeploymentGuardrails();
      const result = await guardrails.runGuardrails();

      if (!result.passed) {
        process.exit(1);
      }
      break;

    case 'pre-commit':
      await DeploymentGuardrails.preCommitCheck();
      break;

    case 'pre-push':
      const prePushGuardrails = new DeploymentGuardrails();
      const prePushResult = await prePushGuardrails.runGuardrails();

      if (!prePushResult.passed) {
        console.log('\n❌ Push blocked');
        process.exit(1);
      }

      console.log('\n✅ Push approved');
      break;

    default:
      console.log('Usage:');
      console.log(
        '  bun run scripts/deployment-guardrails.ts check     - Run guardrails check'
      );
      console.log(
        '  bun run scripts/deployment-guardrails.ts pre-commit - Pre-commit hook'
      );
      console.log(
        '  bun run scripts/deployment-guardrails.ts pre-push  - Pre-push hook'
      );
      break;
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { DeploymentGuardrails };
