/**
 * Test Anomaly Detector
 *
 * Domain: Test analytics and monitoring
 * Responsibility: Anomaly detection algorithms for test metrics
 * Boundaries: Anomaly detection only, no collection logic
 */

import {
  TestAnomaly,
  TestMetrics,
  TestRun,
  TestDataUsageMetrics,
} from './types';

export class AnomalyDetector {
  /**
   * Detects anomalies in test metrics
   */
  static detectAnomalies(metrics: TestMetrics): TestAnomaly[] {
    const anomalies: TestAnomaly[] = [];

    if (!metrics) return anomalies;

    // Performance anomalies
    anomalies.push(...this.detectPerformanceAnomalies(metrics));

    // Coverage anomalies
    anomalies.push(...this.detectCoverageAnomalies(metrics));

    // Flakiness detection
    anomalies.push(...this.detectFlakinessAnomalies(metrics));

    // Test data usage anomalies
    if (metrics.testDataUsage) {
      anomalies.push(...this.detectTestDataAnomalies(metrics.testDataUsage));
    }

    return anomalies;
  }

  /**
   * Detects performance-related anomalies
   */
  private static detectPerformanceAnomalies(
    metrics: TestMetrics
  ): TestAnomaly[] {
    const anomalies: TestAnomaly[] = [];

    if (metrics.duration > 30000) {
      // > 30s
      anomalies.push({
        type: 'performance',
        severity: 'high',
        description: `Test suite took ${metrics.duration}ms, exceeding 30s threshold`,
        suggestedAction:
          'Consider optimizing test setup or splitting test suites',
        timestamp: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Detects coverage-related anomalies
   */
  private static detectCoverageAnomalies(metrics: TestMetrics): TestAnomaly[] {
    const anomalies: TestAnomaly[] = [];

    if (metrics.coverage > 0 && metrics.coverage < 80) {
      anomalies.push({
        type: 'coverage',
        severity: 'medium',
        description: `Test coverage is ${metrics.coverage}%, below 80% threshold`,
        suggestedAction: 'Add tests for uncovered code paths',
        timestamp: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Detects flakiness in test results
   */
  private static detectFlakinessAnomalies(metrics: TestMetrics): TestAnomaly[] {
    const anomalies: TestAnomaly[] = [];

    if (metrics.totalTests > 0) {
      const passRate = (metrics.passedTests / metrics.totalTests) * 100;
      if (passRate > 30 && passRate < 70) {
        // 30-70% pass rate suggests flaky tests
        anomalies.push({
          type: 'flakiness',
          severity: 'medium',
          description: `Test pass rate is ${passRate.toFixed(1)}%, indicating potential flakiness`,
          suggestedAction: 'Review unstable tests and fix race conditions',
          timestamp: new Date(),
        });
      }
    }

    return anomalies;
  }

  /**
   * Detects test data usage anomalies
   */
  private static detectTestDataAnomalies(
    testDataUsage: TestDataUsageMetrics
  ): TestAnomaly[] {
    const anomalies: TestAnomaly[] = [];

    if (
      testDataUsage.cacheHitRate < 0.5 &&
      testDataUsage.storageOperations > 10
    ) {
      anomalies.push({
        type: 'performance',
        severity: 'low',
        description: `Test data cache hit rate is ${(testDataUsage.cacheHitRate * 100).toFixed(1)}%`,
        suggestedAction: 'Consider improving test data caching strategy',
        timestamp: new Date(),
      });
    }

    if (testDataUsage.dataGenerationTime > 5000) {
      // > 5s
      anomalies.push({
        type: 'performance',
        severity: 'medium',
        description: `Test data generation took ${testDataUsage.dataGenerationTime}ms`,
        suggestedAction:
          'Optimize test data generation or use pre-generated data',
        timestamp: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Filters anomalies by severity level
   */
  static filterBySeverity(
    anomalies: TestAnomaly[],
    severity: TestAnomaly['severity']
  ): TestAnomaly[] {
    return anomalies.filter((anomaly) => anomaly.severity === severity);
  }

  /**
   * Filters anomalies by type
   */
  static filterByType(
    anomalies: TestAnomaly[],
    type: TestAnomaly['type']
  ): TestAnomaly[] {
    return anomalies.filter((anomaly) => anomaly.type === type);
  }

  /**
   * Gets recent anomalies within a time window
   */
  static getRecentAnomalies(
    runs: TestRun[],
    hoursBack: number = 24
  ): TestAnomaly[] {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    return runs
      .flatMap((run) => run.anomalies || [])
      .filter((anomaly) => new Date(anomaly.timestamp) > cutoffTime);
  }

  /**
   * Calculates anomaly severity distribution
   */
  static getSeverityDistribution(
    anomalies: TestAnomaly[]
  ): Record<TestAnomaly['severity'], number> {
    return anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.severity] = (acc[anomaly.severity] || 0) + 1;
        return acc;
      },
      {} as Record<TestAnomaly['severity'], number>
    );
  }

  /**
   * Calculates anomaly type distribution
   */
  static getTypeDistribution(
    anomalies: TestAnomaly[]
  ): Record<TestAnomaly['type'], number> {
    return anomalies.reduce(
      (acc, anomaly) => {
        acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
        return acc;
      },
      {} as Record<TestAnomaly['type'], number>
    );
  }
}
