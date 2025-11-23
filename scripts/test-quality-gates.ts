/**
 * Test Quality Gates Script
 *
 * Domain: Test quality validation
 * Responsibility: Enforce test quality thresholds
 * Boundaries: Quality checks only, no test execution
 */

interface TestMetrics {
  numTotalTests: number;
  numFailedTests: number;
  numPassedTests: number;
  numPendingTests: number;
  numTodoTests: number;
}

interface QualityThresholds {
  minPassRate: number;
  maxFailures: number;
  minCoverage: number;
  maxDuration: number;
}

export class TestQualityGates {
  private thresholds: QualityThresholds;

  constructor(thresholds?: Partial<QualityThresholds>) {
    this.thresholds = {
      minPassRate: 95,
      maxFailures: 5,
      minCoverage: 80,
      maxDuration: 30000, // 30 seconds
      ...thresholds,
    };
  }

  validateTestResults(metrics: TestMetrics): {
    passed: boolean;
    violations: string[];
    warnings: string[];
  } {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Calculate pass rate
    const passRate =
      metrics.numTotalTests > 0
        ? (metrics.numPassedTests / metrics.numTotalTests) * 100
        : 0;

    // Check pass rate
    if (passRate < this.thresholds.minPassRate) {
      violations.push(
        `Pass rate ${passRate.toFixed(1)}% is below threshold ${this.thresholds.minPassRate}%`
      );
    }

    // Check failure count
    if (metrics.numFailedTests > this.thresholds.maxFailures) {
      violations.push(
        `Failed tests ${metrics.numFailedTests} exceeds threshold ${this.thresholds.maxFailures}`
      );
    }

    // Check for pending tests
    if (metrics.numPendingTests > 0) {
      warnings.push(`${metrics.numPendingTests} tests are pending completion`);
    }

    // Check for TODO tests
    if (metrics.numTodoTests > 0) {
      warnings.push(`${metrics.numTodoTests} tests have TODO comments`);
    }

    return {
      passed: violations.length === 0,
      violations,
      warnings,
    };
  }

  generateQualityReport(metrics: TestMetrics): string {
    const passRate =
      metrics.numTotalTests > 0
        ? (metrics.numPassedTests / metrics.numTotalTests) * 100
        : 0;

    const validation = this.validateTestResults(metrics);

    let report = '\n📊 Test Quality Report\n';
    report += '='.repeat(50) + '\n\n';

    report += '📈 Metrics:\n';
    report += `  • Total Tests: ${metrics.numTotalTests}\n`;
    report += `  • Passed: ${metrics.numPassedTests}\n`;
    report += `  • Failed: ${metrics.numFailedTests}\n`;
    report += `  • Pass Rate: ${passRate.toFixed(1)}%\n`;

    if (metrics.numPendingTests > 0) {
      report += `  • Pending: ${metrics.numPendingTests}\n`;
    }

    if (metrics.numTodoTests > 0) {
      report += `  • TODO Tests: ${metrics.numTodoTests}\n`;
    }

    report += '\n🎯 Quality Gates:\n';
    report += `  • Min Pass Rate: ${this.thresholds.minPassRate}%\n`;
    report += `  • Max Failures: ${this.thresholds.maxFailures}\n`;
    report += `  • Min Coverage: ${this.thresholds.minCoverage}%\n`;
    report += `  • Max Duration: ${this.thresholds.maxDuration}ms\n`;

    if (validation.violations.length > 0) {
      report += '\n❌ Violations:\n';
      validation.violations.forEach((violation) => {
        report += `  • ${violation}\n`;
      });
    }

    if (validation.warnings.length > 0) {
      report += '\n⚠️ Warnings:\n';
      validation.warnings.forEach((warning) => {
        report += `  • ${warning}\n`;
      });
    }

    if (validation.passed) {
      report += '\n✅ All quality gates passed!\n';
    } else {
      report += '\n🚫 Quality gates failed. Fix violations before pushing.\n';
    }

    report += '='.repeat(50) + '\n';

    return report;
  }

  checkTestFileQuality(filePath: string): {
    passed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    try {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for common test quality issues
      const todoCount = (content.match(/TODO/gi) || []).length;
      const fixmeCount = (content.match(/FIXME/gi) || []).length;
      const consoleCount = (content.match(/console\.(log|error|warn)/g) || [])
        .length;
      const describeCount = (content.match(/describe\(/g) || []).length;
      const itCount = (content.match(/it\(/g) || []).length;

      if (todoCount > 0) {
        issues.push(`Found ${todoCount} TODO comments`);
      }

      if (fixmeCount > 0) {
        issues.push(`Found ${fixmeCount} FIXME comments`);
      }

      if (consoleCount > 2) {
        issues.push(
          `Found ${consoleCount} console statements (should use mocks)`
        );
      }

      if (describeCount === 0) {
        issues.push('No describe blocks found');
      }

      if (itCount === 0) {
        issues.push('No test cases found');
      }

      if (describeCount > 0 && itCount > 0) {
        const testsPerDescribe = itCount / describeCount;
        if (testsPerDescribe > 10) {
          issues.push(
            `Too many tests per describe block (${testsPerDescribe.toFixed(1)})`
          );
        }
      }
    } catch (error) {
      issues.push(`Failed to read file: ${error}`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }
}

// Default quality gates instance
export const testQualityGates = new TestQualityGates();
