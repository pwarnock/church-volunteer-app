/**
 * Test Metrics Types
 *
 * Domain: Test analytics and monitoring
 * Responsibility: TypeScript interfaces for test metrics system
 * Boundaries: Type definitions only
 */

export interface TestMetrics {
  testSuite: string;
  duration: number;
  passRate: number;
  coverage: number;
  memoryUsage: number;
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testDataUsage?: TestDataUsageMetrics;
}

export interface TestDataUsageMetrics {
  dataTypes: string[];
  dataSources: string[];
  cacheHitRate: number;
  dataGenerationTime: number;
  storageOperations: number;
  versionHistorySize: number;
}

export interface TestAnomaly {
  type: 'performance' | 'coverage' | 'flakiness' | 'integration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedAction: string;
  timestamp: Date;
}

export interface TestRun {
  id: string;
  startTime: Date;
  endTime?: Date;
  metrics?: TestMetrics;
  anomalies: TestAnomaly[];
}

export interface PerformanceTrends {
  trend: 'improving' | 'degrading' | 'stable' | 'insufficient_data';
  improvement: number;
  recentAvg?: number;
  olderAvg?: number;
}

export interface QualityTrends {
  trend: 'excellent' | 'good' | 'fair' | 'poor' | 'insufficient_data';
  avgCoverage: number;
  recent?: number[];
}

export interface StabilityTrends {
  score: number;
  trend: 'stable' | 'moderate' | 'unstable';
  failureRate: number;
}

export interface TestDashboardData {
  current: TestRun;
  trends: {
    performance: PerformanceTrends;
    quality: QualityTrends;
    stability: StabilityTrends;
  };
  anomalies: TestAnomaly[];
  summary: {
    totalRuns: number;
    avgDuration: number;
    avgPassRate: number;
    lastUpdated: string;
  };
}

export interface TestReport {
  generatedAt: string;
  summary: {
    totalRuns: number;
    avgDuration: number;
    avgPassRate: number;
  };
  anomalies: TestAnomaly[];
  recommendations: TestRecommendation[];
}

export interface TestRecommendation {
  type: 'performance' | 'quality' | 'stability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}
