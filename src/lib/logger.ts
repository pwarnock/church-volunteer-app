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

  // TODO: Send to external observability platform (Logfire, Sentry, etc.)
  // Example:
  // if (process.env.LOGFIRE_TOKEN) {
  //   fetch('https://logfire.pydantic.dev/api/logs', {
  //     method: 'POST',
  //     headers: { 'Authorization': `Bearer ${process.env.LOGFIRE_TOKEN}` },
  //     body: JSON.stringify(entry)
  //   }).catch(() => {}) // Fail silently
  // }
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
