/**
 * Performance monitoring and metrics collection
 * Tracks database queries, API response times, and application health
 */

interface MetricEntry {
  timestamp: string;
  metric: string;
  value: number;
  unit: string;
  context?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'critical';
}

const metrics: MetricEntry[] = [];
const MAX_METRICS = 1000; // Keep last 1000 metrics in memory

/**
 * Record a metric
 */
export function recordMetric(
  metric: string,
  value: number,
  unit: string = 'ms',
  context?: Record<string, unknown>,
  severity?: 'info' | 'warning' | 'critical'
) {
  const entry: MetricEntry = {
    timestamp: new Date().toISOString(),
    metric,
    value,
    unit,
    context,
    severity: severity || determineSeverity(metric, value),
  };

  metrics.push(entry);

  // Keep memory bounded
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }

  // Log critical metrics immediately
  if (entry.severity === 'critical') {
    console.error(`[CRITICAL METRIC] ${metric}: ${value}${unit}`, context);
    reportToSentry(entry);
  } else if (entry.severity === 'warning') {
    console.warn(`[WARNING METRIC] ${metric}: ${value}${unit}`, context);
  }
}

/**
 * Determine severity based on metric type and value
 */
function determineSeverity(
  metric: string,
  value: number
): 'info' | 'warning' | 'critical' {
  // Database query thresholds
  if (metric.includes('database')) {
    if (value > 5000) return 'critical'; // >5s
    if (value > 1000) return 'warning'; // >1s
  }

  // API response thresholds
  if (metric.includes('api') || metric.includes('request')) {
    if (value > 3000) return 'critical'; // >3s
    if (value > 1000) return 'warning'; // >1s
  }

  // Error rate thresholds
  if (metric.includes('error')) {
    if (value > 10) return 'critical'; // >10%
    if (value > 5) return 'warning'; // >5%
  }

  return 'info';
}

/**
 * Record API response time
 */
export function recordApiResponse(
  endpoint: string,
  method: string,
  status: number,
  durationMs: number
) {
  recordMetric(`api.${method.toLowerCase()}.${endpoint}`, durationMs, 'ms', {
    endpoint,
    method,
    status,
  });
}

/**
 * Record database query time
 */
export function recordDatabaseQuery(
  operation: string,
  model: string,
  durationMs: number,
  success: boolean = true
) {
  recordMetric(
    `database.${operation.toLowerCase()}.${model}`,
    durationMs,
    'ms',
    { operation, model, success }
  );
}

/**
 * Record authentication attempt
 */
export function recordAuthAttempt(
  method: string,
  success: boolean,
  durationMs: number
) {
  recordMetric(`auth.${method}`, durationMs, 'ms', { method, success });
}

/**
 * Record rate limit hit
 */
export function recordRateLimitHit(
  endpoint: string,
  userId: string | 'anonymous'
) {
  recordMetric(`rate_limit.${endpoint}`, 1, 'count', { endpoint, userId });
}

/**
 * Record error
 */
export function recordError(error: Error, context?: Record<string, unknown>) {
  recordMetric(
    `error.${error.name}`,
    1,
    'count',
    { ...context, message: error.message },
    'critical'
  );
}

/**
 * Get metrics summary
 */
export function getMetricsSummary() {
  if (metrics.length === 0) {
    return { message: 'No metrics recorded yet' };
  }

  const grouped: Record<string, number[]> = {};
  metrics.forEach((m) => {
    if (!grouped[m.metric]) grouped[m.metric] = [];
    grouped[m.metric].push(m.value);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summary: Record<string, any> = {};
  Object.entries(grouped).forEach(([metric, values]) => {
    const sorted = values.sort((a, b) => a - b);
    summary[metric] = {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  });

  return {
    totalMetrics: metrics.length,
    recordedAt: new Date().toISOString(),
    summary,
  };
}

/**
 * Report metric to Sentry for alerting
 */
function reportToSentry(entry: MetricEntry) {
  try {
    // Dynamic import to avoid bundling Sentry if not used
    const sentryModule = import('@sentry/nextjs');
    sentryModule
      .then((Sentry) => {
        if (Sentry && Sentry.captureMessage) {
          Sentry.captureMessage(
            `Critical Metric: ${entry.metric} = ${entry.value}${entry.unit}`,
            'error'
          );
        }
      })
      .catch(() => {
        // Sentry not available
      });
  } catch {
    // Sentry not available
  }
}

/**
 * Expose metrics via API endpoint
 * Call this in /api/metrics route handler
 */
export function exposeMetrics() {
  return {
    success: true,
    data: getMetricsSummary(),
    timestamp: new Date().toISOString(),
  };
}
