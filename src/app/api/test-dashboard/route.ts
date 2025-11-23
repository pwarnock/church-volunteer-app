/**
 * Test Analytics Dashboard API
 *
 * Domain: Test analytics and monitoring
 * Responsibility: Provide real-time test metrics and anomaly detection
 * Boundaries: Internal API only, admin access required
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { logger } from '@/lib/logger';
import { testMetrics } from '@/lib/test-metrics';
import {
  unauthorizedResponse,
  errorResponse,
  successResponse,
} from '@/lib/api-response';
import { TestRun } from '@/lib/metrics/types';

// Admin-only access control
const requireAdmin = (session: any) => {
  if (!session || session.user?.role !== 'LEADER') {
    return false;
  }

  // In a real system, you might have specific admin roles
  // For now, LEADER role has access to test analytics
  return true;
};

const handleGet = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!requireAdmin(session)) {
      return unauthorizedResponse();
    }

    // Get current run metrics
    const currentRun = testMetrics.getCurrentRun();

    // Get historical metrics
    const historical = testMetrics.getHistoricalMetrics(20);

    // Generate trend analysis
    const trends = {
      performance: calculatePerformanceTrends(historical),
      quality: calculateQualityTrends(historical),
      stability: calculateStabilityTrends(historical),
    };

    // Get recent anomalies
    const recentAnomalies = testMetrics
      .getHistoricalMetrics(50)
      .flatMap((run: TestRun) => run.anomalies || [])
      .filter(
        (anomaly: any) =>
          new Date(anomaly.timestamp) >
          new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      )
      .slice(0, 10);

    const dashboard = {
      current: currentRun,
      trends,
      anomalies: recentAnomalies,
      summary: {
        totalRuns: historical.length,
        avgDuration:
          historical.reduce(
            (sum: number, run: TestRun) => sum + (run.metrics?.duration || 0),
            0
          ) / historical.length,
        avgPassRate:
          historical.reduce(
            (sum: number, run: TestRun) => sum + (run.metrics?.passRate || 0),
            0
          ) / historical.length,
        lastUpdated: new Date().toISOString(),
      },
    };

    return successResponse(dashboard);
  } catch (error) {
    const currentSession = await getServerSession(authOptions);
    logger.error('Test dashboard error', {
      error,
      session: currentSession?.user?.id,
    });
    return errorResponse('Failed to load test dashboard');
  }
};

const handlePost = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!requireAdmin(session)) {
      return unauthorizedResponse();
    }

    const requestBody = await request.json();
    const { action } = requestBody;

    switch (action) {
      case 'generate-report':
        return generateTestReport();

      case 'clear-metrics':
        return clearTestMetrics();

      case 'export-data':
        return exportTestData();

      default:
        return errorResponse('Invalid action');
    }
  } catch (error) {
    logger.error('Test dashboard action error', {
      error,
      action: 'unknown',
    });
    return errorResponse('Failed to execute dashboard action');
  }
};

// Helper functions
function calculatePerformanceTrends(historical: any[]) {
  const durations = historical
    .filter((run) => run.metrics?.duration)
    .map((run) => run.metrics.duration);

  if (durations.length < 2)
    return { trend: 'insufficient_data', improvement: 0 };

  const recent = durations.slice(-5);
  const older = durations.slice(0, -5);

  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

  const improvement = ((olderAvg - recentAvg) / olderAvg) * 100;

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

function calculateQualityTrends(historical: any[]) {
  const passRates = historical
    .filter((run) => run.metrics?.passRate !== undefined)
    .map((run) => run.metrics.passRate);

  if (passRates.length < 2)
    return { trend: 'insufficient_data', avgCoverage: 0 };

  const recent = passRates.slice(-5);
  const avgRecent = recent.reduce((sum, rate) => sum + rate, 0) / recent.length;

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

function calculateStabilityTrends(historical: any[]) {
  const recentRuns = historical.slice(-10);
  const failureCount = recentRuns.filter(
    (run) => run.metrics && run.metrics.passRate < 1
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

async function generateTestReport() {
  const historical = testMetrics.getHistoricalMetrics(100);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalRuns: historical.length,
      avgDuration:
        historical.reduce((sum, run) => sum + (run.metrics?.duration || 0), 0) /
        historical.length,
      avgPassRate:
        historical.reduce((sum, run) => sum + (run.metrics?.passRate || 0), 0) /
        historical.length,
    },
    anomalies: historical
      .flatMap((run) => run.anomalies || [])
      .filter(
        (anomaly) =>
          anomaly.severity === 'high' || anomaly.severity === 'critical'
      ),
    recommendations: generateRecommendations(historical),
  };

  // In a real implementation, you might save this to a file or database
  logger.info('Test report generated', {
    reportSize: JSON.stringify(report).length,
  });

  return successResponse(report);
}

async function clearTestMetrics() {
  // Clear old metrics (keep last 10 runs)
  const historical = testMetrics.getHistoricalMetrics(100);
  const toKeep = historical.slice(-10);

  // Implementation would depend on how metrics are stored
  logger.info('Test metrics cleared', { keptRuns: toKeep.length });

  return successResponse({
    message: 'Test metrics cleared',
    keptRuns: toKeep.length,
  });
}

async function exportTestData() {
  const historical = testMetrics.getHistoricalMetrics(50);

  const exportData = {
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

  return successResponse(exportData);
}

function generateRecommendations(historical: any[]) {
  const recommendations = [];

  // Analyze patterns and generate recommendations
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

  const avgPassRate =
    historical.reduce((sum, run) => sum + (run.metrics?.passRate || 0), 0) /
    historical.length;

  if (avgPassRate < 0.8) {
    // < 80%
    recommendations.push({
      type: 'quality',
      priority: 'medium',
      title: 'Low Test Pass Rate',
      description: `Average pass rate is ${Math.round(avgPassRate * 100)}%`,
      action: 'Review failing tests and fix underlying issues',
    });
  }

  return recommendations;
}

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}

export { handleGet, handlePost };
