/**
 * Centralized logging utility with observability readiness
 * Structured logging for development and production
 *
 * Can be integrated with external services like:
 * - Pydantic Logfire (via API endpoint)
 * - Sentry
 * - DataDog
 * - CloudWatch
 */

interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Format error for logging
 */
function formatError(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: 'Unknown',
    message: String(error),
  };
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: string,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
  if (error) {
    entry.error = formatError(error);
  }
  return entry;
}

/**
 * Output log entry (console in development, structured JSON in production)
 */
function outputLog(entry: LogEntry) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // Development: pretty print to console
    const logFn = entry.level === 'ERROR' ? console.error : console.log;

    logFn(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, {
      context: entry.context,
      error: entry.error,
    });
  } else {
    // Production: JSON output for log aggregation services
    console.log(JSON.stringify(entry));
  }

  // Send to external observability platform (optional, feature-flagged)
  sendToObservabilityPlatform(entry);
}

/**
 * Send log entry to external observability platform
 * Supports: Logfire (Pydantic), Sentry, DataDog, CloudWatch
 */
async function sendToObservabilityPlatform(entry: LogEntry) {
  // Logfire integration (https://logfire.pydantic.dev/)
  if (process.env.LOGFIRE_TOKEN) {
    try {
      // Non-blocking async call
      fetch('https://logfire.pydantic.dev/api/logs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.LOGFIRE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: entry.timestamp,
          level: entry.level.toLowerCase(),
          message: entry.message,
          context: entry.context,
          error: entry.error,
        }),
      }).catch(() => {
        // Fail silently - don't block application if service is down
      });
    } catch {
      // Ignore errors from logging service
    }
  }

  // DataDog integration (optional)
  if (process.env.DATADOG_API_KEY) {
    try {
      fetch('https://http-intake.logs.datadoghq.com/v1/input', {
        method: 'POST',
        headers: {
          'DD-API-KEY': process.env.DATADOG_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date(entry.timestamp).getTime(),
          level: entry.level.toLowerCase(),
          message: entry.message,
          context: entry.context,
          error: entry.error,
        }),
      }).catch(() => {});
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Logger interface
 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    const entry = createLogEntry('DEBUG', message, context);
    if (process.env.NODE_ENV === 'development') {
      outputLog(entry);
    }
  },

  info: (message: string, context?: LogContext) => {
    const entry = createLogEntry('INFO', message, context);
    outputLog(entry);
  },

  warn: (message: string, context?: LogContext, error?: unknown) => {
    const entry = createLogEntry('WARN', message, context, error);
    outputLog(entry);
  },

  error: (message: string, error?: unknown, context?: LogContext) => {
    const entry = createLogEntry('ERROR', message, context, error);
    outputLog(entry);
  },
};

export default logger;
