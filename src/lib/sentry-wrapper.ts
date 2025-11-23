/**
 * Sentry wrapper for Next.js
 * Conditionally wraps Next.js API and page routes with Sentry error handling
 *
 * Usage in next.config.ts:
 * import { withSentryConfig } from '@sentry/nextjs';
 * export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Wrap API route with Sentry error handling (if enabled)
 */
export function withSentryErrorHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFunction extends (...args: any[]) => Promise<any>,
>(handler: TFunction, operationName?: string): TFunction {
  // Only wrap if Sentry is enabled
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const enabled = dsn && authToken && process.env.SENTRY_ENABLED !== 'false';

  if (!enabled) {
    return handler;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          operation: operationName || 'api-handler',
        },
      });
      throw error; // Re-throw to maintain normal error handling
    }
  }) as TFunction;
}

/**
 * Create breadcrumb for tracking important events
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    Sentry.addBreadcrumb({
      message,
      data,
      level,
      timestamp: Date.now() / 1000,
    });
  } catch (e) {
    console.error('Failed to add breadcrumb:', e);
  }
}

/**
 * Report performance metric
 */
export function reportPerformanceMetric(
  metricName: string,
  value: number,
  unit: string = 'ms'
) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    Sentry.captureMessage(
      `Performance: ${metricName} = ${value}${unit}`,
      'info'
    );
  } catch (e) {
    console.error('Failed to report performance metric:', e);
  }
}
