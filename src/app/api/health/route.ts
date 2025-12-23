import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0; // Don't cache health checks

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    let databaseStatus = 'not-configured';

    // Only check database if URL is configured
    if (databaseUrl) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      } catch (dbError) {
        console.error('Database connection failed:', dbError);
        databaseStatus = 'disconnected';
        // Do not throw; return degraded status for preview environments
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      hasDatabaseUrl: !!databaseUrl,
      environment: process.env.NODE_ENV || 'unknown',
      version: '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
