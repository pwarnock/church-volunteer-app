/**
 * Test Report Generator
 *
 * Domain: Test analytics and monitoring
 * Responsibility: Report generation logic for test metrics
 * Boundaries: Report generation only, no collection or analysis logic
 */

import {
  TestRun,
  PerformanceTrends,
  QualityTrends,
  StabilityTrends,
  TestReport,
  TestRecommendation,
} from './types';

export class ReportGenerator {
  /**
   * Generates a markdown report from test runs
   */
  static generateMarkdownReport(runs: TestRun[]): string {
    if (runs.length === 0) {
      return 'No test runs found.';
    }

    let report = '# Test Metrics Report\n\n';

    runs.forEach((run, index) => {
      report += `## Run ${index + 1}: ${run.id}\n`;
      report += `- **Start**: ${run.startTime.toISOString()}\n`;
      report += `- **End**: ${run.endTime?.toISOString() || 'In progress'}\n`;

      if (run.metrics) {
        report += `- **Duration**: ${run.metrics.duration}ms\n`;
        report += `- **Tests**: ${run.metrics.passedTests}/${run.metrics.totalTests} (${run.metrics.passRate.toFixed(1)}%)\n`;
        report += `- **Coverage**: ${run.metrics.coverage}%\n`;
        report += `- **Memory**: ${(run.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;

        if (run.metrics.testDataUsage) {
          const usage = run.metrics.testDataUsage;
          report += `- **Data Types**: ${usage.dataTypes.join(', ')}\n`;
          report += `- **Cache Hit Rate**: ${(usage.cacheHitRate * 100).toFixed(1)}%\n`;
          report += `- **Data Generation**: ${usage.dataGenerationTime}ms\n`;
        }
      }

      if (run.anomalies.length > 0) {
        report += `- **Anomalies**: ${run.anomalies.length}\n`;
        run.anomalies.forEach((anomaly) => {
          report += `  - ${anomaly.severity.toUpperCase()}: ${anomaly.description}\n`;
        });
      }

      report += '\n';
    });

    return report;
  }

  /**
   * Calculates performance trends from historical data
   */
  static calculatePerformanceTrends(historical: TestRun[]): PerformanceTrends {
    const durations = historical
      .filter((run) => run.metrics?.duration)
      .map((run) => run.metrics!.duration);

    if (durations.length < 2) {
      return { trend: 'insufficient_data', improvement: 0 };
    }

    const recent = durations.slice(-5);
    const older = durations.slice(0, -5);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, val) => sum + val, 0) / older.length
        : recentAvg;

    const improvement =
      olderAvg > 0 ? ((olderAvg - recentAvg) / olderAvg) * 100 : 0;

    return {
      trend:
        improvement > 10
          ? 'improving'
          : improvement < -10
            ? 'degrading'
            : 'stable',
      improvement: Math.round(improvement),
      recentAvg: Math.round(recentAvg),
      olderAvg: Math.round(olderAvg),
    };
  }

  /**
   * Calculates quality trends from historical data
   */
  static calculateQualityTrends(historical: TestRun[]): QualityTrends {
    const passRates = historical
      .filter((run) => run.metrics?.passRate !== undefined)
      .map((run) => run.metrics!.passRate);

    if (passRates.length < 2) {
      return { trend: 'insufficient_data', avgCoverage: 0 };
    }

    const recent = passRates.slice(-5);
    const avgRecent =
      recent.reduce((sum, rate) => sum + rate, 0) / recent.length;

    return {
      trend:
        avgRecent > 0.9
          ? 'excellent'
          : avgRecent > 0.8
            ? 'good'
            : avgRecent > 0.7
              ? 'fair'
              : 'poor',
      avgCoverage: Math.round(avgRecent * 100),
      recent: recent.map((rate) => Math.round(rate * 100)),
    };
  }

  /**
   * Calculates stability trends from historical data
   */
  static calculateStabilityTrends(historical: TestRun[]): StabilityTrends {
    const recentRuns = historical.slice(-10);
    const failureCount = recentRuns.filter(
      (run) => run.metrics && run.metrics.passRate < 100
    ).length;

    const stabilityScore =
      ((recentRuns.length - failureCount) / recentRuns.length) * 100;

    return {
      score: Math.round(stabilityScore),
      trend:
        stabilityScore >= 90
          ? 'stable'
          : stabilityScore >= 70
            ? 'moderate'
            : 'unstable',
      failureRate: Math.round((failureCount / recentRuns.length) * 100),
    };
  }

  /**
   * Generates a comprehensive test report
   */
  static generateTestReport(historical: TestRun[]): TestReport {
    const summary = {
      totalRuns: historical.length,
      avgDuration:
        historical.reduce((sum, run) => sum + (run.metrics?.duration || 0), 0) /
        Math.max(historical.length, 1),
      avgPassRate:
        historical.reduce((sum, run) => sum + (run.metrics?.passRate || 0), 0) /
        Math.max(historical.length, 1),
    };

    const anomalies = historical
      .flatMap((run) => run.anomalies || [])
      .filter(
        (anomaly) =>
          anomaly.severity === 'high' || anomaly.severity === 'critical'
      );

    return {
      generatedAt: new Date().toISOString(),
      summary,
      anomalies,
      recommendations: this.generateRecommendations(historical),
    };
  }

  /**
   * Generates recommendations based on test metrics
   */
  static generateRecommendations(historical: TestRun[]): TestRecommendation[] {
    const recommendations: TestRecommendation[] = [];

    if (historical.length === 0) {
      return recommendations;
    }

    // Analyze performance
    const avgDuration =
      historical.reduce((sum, run) => sum + (run.metrics?.duration || 0), 0) /
      historical.length;

    if (avgDuration > 30000) {
      // > 30s
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Slow Test Execution',
        description: 'Average test duration exceeds 30 seconds',
        action: 'Consider optimizing test setup or splitting test suites',
      });
    }

    // Analyze quality
    const avgPassRate =
      historical.reduce((sum, run) => sum + (run.metrics?.passRate || 0), 0) /
      historical.length;

    if (avgPassRate < 80) {
      // < 80%
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        title: 'Low Test Pass Rate',
        description: `Average pass rate is ${Math.round(avgPassRate)}%`,
        action: 'Review failing tests and fix underlying issues',
      });
    }

    // Analyze stability
    const recentFailures = historical
      .slice(-10)
      .filter((run) => run.metrics && run.metrics.passRate < 100).length;

    if (recentFailures > 3) {
      recommendations.push({
        type: 'stability',
        priority: 'high',
        title: 'Test Instability',
        description: `${recentFailures} of the last 10 runs had failures`,
        action: 'Investigate flaky tests and improve test reliability',
      });
    }

    return recommendations;
  }

  /**
   * Generates export data for test metrics
   */
  static generateExportData(historical: TestRun[]) {
    return {
      exportedAt: new Date().toISOString(),
      runs: historical,
      summary: {
        totalRuns: historical.length,
        dateRange: {
          from: historical[0]?.startTime,
          to: historical[historical.length - 1]?.endTime,
        },
      },
    };
  }

  /**
   * Formats duration in human-readable format
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      return `${(milliseconds / 60000).toFixed(1)}m`;
    }
  }

  /**
   * Formats memory usage in human-readable format
   */
  static formatMemory(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)}KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
    }
  }
}
