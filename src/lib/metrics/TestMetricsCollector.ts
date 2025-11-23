/**
 * Test Metrics Collector
 *
 * Domain: Test analytics and monitoring
 * Responsibility: Core collection logic for test metrics
 * Boundaries: Metrics collection only, no analysis logic
 */

import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'fs';
import { join } from 'path';
import {
  TestRun,
  TestMetrics,
  TestDataUsageMetrics,
  TestAnomaly,
} from './types';

export class TestMetricsCollector {
  private metricsPath: string;
  private currentRun: TestRun;

  constructor() {
    this.metricsPath = join(process.cwd(), '.test-metrics');
    this.ensureMetricsDirectory();
    this.currentRun = this.createNewRun();
  }

  /**
   * Ensures the metrics directory exists
   */
  private ensureMetricsDirectory(): void {
    if (!existsSync(this.metricsPath)) {
      mkdirSync(this.metricsPath, { recursive: true });
    }
  }

  /**
   * Creates a new test run with unique ID
   */
  private createNewRun(): TestRun {
    return {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      startTime: new Date(),
      anomalies: [],
    };
  }

  /**
   * Records test data usage metrics
   */
  recordTestDataUsage(
    dataType: string,
    source: string,
    cacheHit: boolean,
    generationTime: number
  ): void {
    if (!this.currentRun.metrics?.testDataUsage) {
      return;
    }

    const usage = this.currentRun.metrics.testDataUsage;

    // Track data types and sources
    if (!usage.dataTypes.includes(dataType)) {
      usage.dataTypes.push(dataType);
    }
    if (!usage.dataSources.includes(source)) {
      usage.dataSources.push(source);
    }

    // Update cache hit rate
    usage.cacheHitRate = cacheHit
      ? (usage.cacheHitRate + 1) / 2
      : usage.cacheHitRate * 0.9;

    // Track generation time
    usage.dataGenerationTime += generationTime;
    usage.storageOperations++;
  }

  /**
   * Records a single test result
   */
  recordTestResult(
    testName: string,
    passed: boolean,
    duration: number,
    error?: Error
  ): void {
    // Initialize metrics if needed
    if (!this.currentRun.metrics) {
      this.currentRun.metrics = this.initializeMetrics();
    }

    this.currentRun.metrics.totalTests++;
    if (passed) {
      this.currentRun.metrics.passedTests++;
    } else {
      this.currentRun.metrics.failedTests++;
    }
    this.currentRun.metrics.duration += duration;

    console.log(
      `${passed ? '✅' : '❌'} ${testName} (${duration}ms)${error ? ` - ${error.message}` : ''}`
    );
  }

  /**
   * Initializes default metrics structure
   */
  private initializeMetrics(): TestMetrics {
    return {
      testSuite: 'unknown',
      duration: 0,
      passRate: 0,
      coverage: 0,
      memoryUsage: 0,
      timestamp: new Date(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testDataUsage: {
        dataTypes: [],
        dataSources: [],
        cacheHitRate: 0,
        dataGenerationTime: 0,
        storageOperations: 0,
        versionHistorySize: 0,
      },
    };
  }

  /**
   * Finalizes the current test run and returns completed run data
   */
  finishRun(): TestRun {
    this.currentRun.endTime = new Date();

    // Calculate final metrics
    if (this.currentRun.metrics) {
      const metrics = this.currentRun.metrics;
      metrics.passRate =
        metrics.totalTests > 0
          ? (metrics.passedTests / metrics.totalTests) * 100
          : 0;

      // Get memory usage
      if (typeof process !== 'undefined' && process.memoryUsage) {
        metrics.memoryUsage = process.memoryUsage().heapUsed;
      }
    }

    // Save run data
    this.saveRun();

    const completedRun = { ...this.currentRun };
    this.currentRun = this.createNewRun();

    return completedRun;
  }

  /**
   * Saves the current run to disk
   */
  private saveRun(): void {
    const runFile = join(this.metricsPath, `${this.currentRun.id}.json`);

    try {
      writeFileSync(runFile, JSON.stringify(this.currentRun, null, 2));
      console.log(`📊 Test metrics saved: ${runFile}`);
    } catch (error) {
      console.error('Failed to save test metrics:', error);
    }
  }

  /**
   * Retrieves historical test runs from disk
   */
  getHistoricalRuns(limit: number = 10): TestRun[] {
    try {
      const files = readdirSync(this.metricsPath)
        .filter((file: string) => file.endsWith('.json'))
        .sort((a: string, b: string) => {
          const statA = statSync(join(this.metricsPath, a));
          const statB = statSync(join(this.metricsPath, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        })
        .slice(0, limit);

      return files
        .map((file: string) => {
          const filepath = join(this.metricsPath, file);
          try {
            const content = readFileSync(filepath, 'utf-8');
            const run = JSON.parse(content);
            // Convert date strings back to Date objects
            run.startTime = new Date(run.startTime);
            if (run.endTime) run.endTime = new Date(run.endTime);
            if (run.metrics?.timestamp)
              run.metrics.timestamp = new Date(run.metrics.timestamp);
            if (run.anomalies) {
              run.anomalies.forEach((anomaly: TestAnomaly) => {
                anomaly.timestamp = new Date(anomaly.timestamp);
              });
            }
            return run;
          } catch (error) {
            console.error(`Failed to load metrics file ${file}:`, error);
            return null;
          }
        })
        .filter((run): run is TestRun => run !== null);
    } catch (error) {
      console.error('Failed to load historical runs:', error);
      return [];
    }
  }

  /**
   * Returns the current active test run
   */
  getCurrentRun(): TestRun {
    return this.currentRun;
  }

  /**
   * Legacy method for backward compatibility
   */
  getHistoricalMetrics(limit: number = 10): TestRun[] {
    return this.getHistoricalRuns(limit);
  }
}

// Global metrics collector instance
export const testMetricsCollector = new TestMetricsCollector();
