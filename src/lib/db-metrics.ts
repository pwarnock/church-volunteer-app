/**
 * Database monitoring utility
 * Wraps Prisma operations to record performance metrics and log slow queries
 */

import { recordDatabaseQuery } from './metrics';
import { logger } from './logger';

/**
 * Wrap a database operation to measure performance and log slow queries
 */
export async function withDatabaseMetrics<T>(
  operation: string,
  model: string,
  query: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  let success = true;

  try {
    const result = await query();
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;

    // Record metric
    recordDatabaseQuery(operation, model, duration, success);

    // Log slow queries (>1s in development, >5s in production)
    const slowQueryThreshold =
      process.env.NODE_ENV === 'development' ? 1000 : 5000;
    if (duration > slowQueryThreshold) {
      logger.warn('Slow database query', {
        model,
        operation,
        duration: `${duration}ms`,
        threshold: `${slowQueryThreshold}ms`,
      });
    }
  }
}
