import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ErrorCategory, ErrorSeverity } from '@/lib/logger';

// In production, errors would be stored in a proper error logging system
// For now, we'll simulate with a memory store and database queries
const errorStore = new Map<string, any>();

// Simulate error data (in production, this would come from your logging system)
const simulateErrorData = () => {
  const now = new Date();
  const errors = [];

  // Generate some sample errors for demonstration
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(
      now.getTime() - Math.random() * 24 * 60 * 60 * 1000
    );
    const categories = Object.values(ErrorCategory);
    const severities = Object.values(ErrorSeverity);

    errors.push({
      id: `error-${i}`,
      timestamp: timestamp.toISOString(),
      level: Math.random() > 0.8 ? 'ERROR' : 'WARN',
      category: categories[Math.floor(Math.random() * categories.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: [
        'Failed to authenticate user',
        'Database connection timeout',
        'Rate limit exceeded',
        'Invalid request parameters',
        'External API error',
        'Unauthorized access attempt',
        'Validation failed for user input',
      ][Math.floor(Math.random() * 7)],
      isUserFacing: Math.random() > 0.3,
      requiresAlert: Math.random() > 0.7,
      endpoint: [
        '/api/auth/signin',
        '/api/opportunities',
        '/api/applications',
        '/api/users',
      ][Math.floor(Math.random() * 4)],
      userId:
        Math.random() > 0.5
          ? `user-${Math.floor(Math.random() * 1000)}`
          : undefined,
      userAgent: 'Mozilla/5.0 (simulated)',
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    });
  }

  return errors.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export async function GET(request: NextRequest) {
  try {
    // Check authorization (only admin/leaders can access error dashboard)
    const session = await getServerSession(authOptions);
    if (!session || !['MINISTRY_LEADER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // In production, this would query your error logging system
    // For demo, we'll generate sample data
    const allErrors = simulateErrorData();

    // Filter by time range
    const now = new Date();
    let filterTime = new Date();

    switch (timeRange) {
      case '1h':
        filterTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        filterTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        filterTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        filterTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const filteredErrors = allErrors.filter(
      (error) => new Date(error.timestamp) >= filterTime
    );

    // Calculate statistics
    const stats = {
      total: filteredErrors.length,
      critical: filteredErrors.filter(
        (e) => e.severity === ErrorSeverity.CRITICAL
      ).length,
      high: filteredErrors.filter((e) => e.severity === ErrorSeverity.HIGH)
        .length,
      medium: filteredErrors.filter((e) => e.severity === ErrorSeverity.MEDIUM)
        .length,
      low: filteredErrors.filter((e) => e.severity === ErrorSeverity.LOW)
        .length,
      byCategory: filteredErrors.reduce(
        (acc, error) => {
          acc[error.category] = (acc[error.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byEndpoint: filteredErrors.reduce(
        (acc, error) => {
          acc[error.endpoint] = (acc[error.endpoint] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentCount: filteredErrors.filter(
        (error) =>
          new Date(error.timestamp) >= new Date(now.getTime() - 60 * 60 * 1000)
      ).length,
    };

    return NextResponse.json({
      errors: filteredErrors,
      stats,
      timeRange,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch error data' },
      { status: 500 }
    );
  }
}
