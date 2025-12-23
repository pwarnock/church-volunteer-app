import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getMetricsSummary } from '@/lib/metrics';

/**
 * Metrics endpoint - requires authentication
 * Returns performance metrics, database query times, error rates, etc.
 *
 * Endpoint: GET /api/metrics
 * Returns: Aggregated metrics with min/max/avg/p95/p99 statistics
 */
export async function GET() {
  try {
    // Require admin/leader access for security
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'MINISTRY_LEADER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const metrics = {
      success: true,
      data: getMetricsSummary(),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Metrics endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
