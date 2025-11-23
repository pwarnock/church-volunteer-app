/**
 * Test Metrics Collection
 *
 * Domain: Test analytics and monitoring
 * Responsibility: Collect, analyze, and report test metrics
 * Boundaries: Metrics collection only, no test execution logic
 */

// Re-export all types and classes from modular structure
export * from './metrics/types';
export {
  TestMetricsCollector,
  testMetricsCollector,
} from './metrics/TestMetricsCollector';
export { AnomalyDetector } from './metrics/AnomalyDetector';
export { ReportGenerator } from './metrics/ReportGenerator';

// Legacy compatibility - create a unified testMetrics object
import { TestMetricsCollector } from './metrics/TestMetricsCollector';
import { AnomalyDetector } from './metrics/AnomalyDetector';
import { ReportGenerator } from './metrics/ReportGenerator';

const collector = new TestMetricsCollector();

export const testMetrics = {
  getCurrentRun: () => collector.getCurrentRun(),
  getHistoricalMetrics: (limit?: number) => collector.getHistoricalRuns(limit),
  recordTestResult: (
    testName: string,
    passed: boolean,
    duration: number,
    error?: Error
  ) => collector.recordTestResult(testName, passed, duration, error),
  recordTestDataUsage: (
    dataType: string,
    source: string,
    cacheHit: boolean,
    generationTime: number
  ) =>
    collector.recordTestDataUsage(dataType, source, cacheHit, generationTime),
  finishRun: () => collector.finishRun(),
  generateReport: () =>
    ReportGenerator.generateMarkdownReport(collector.getHistoricalRuns(5)),
  detectAnomalies: () => {
    const currentRun = collector.getCurrentRun();
    if (currentRun.metrics) {
      const anomalies = AnomalyDetector.detectAnomalies(currentRun.metrics);
      currentRun.anomalies.push(...anomalies);
      return anomalies;
    }
    return [];
  },
};
