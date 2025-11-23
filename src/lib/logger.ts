/**
 * Centralized logging utility for the application
 * In production, this can integrate with external logging services (Sentry, LogRocket, etc.)
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
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
  level: LogLevel,
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
 * Output log entry (console in development, external service in production)
 */
function outputLog(entry: LogEntry) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // Development: pretty print to console
    const logFn =
      entry.level === LogLevel.ERROR
        ? console.error
        : entry.level === LogLevel.WARN
          ? console.warn
          : console.log;

    logFn(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, {
      context: entry.context,
      error: entry.error,
    });
  } else {
    // Production: send structured log to external service
    // Example: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    // For now, just output as JSON for centralized logging systems to parse
    console.log(JSON.stringify(entry));
  }
}

/**
 * Logger interface
 */
export const logger = {
  debug: (message: string, context?: LogContext) => {
    const entry = createLogEntry(LogLevel.DEBUG, message, context);
    if (process.env.NODE_ENV === 'development') {
      outputLog(entry);
    }
  },

  info: (message: string, context?: LogContext) => {
    const entry = createLogEntry(LogLevel.INFO, message, context);
    outputLog(entry);
  },

  warn: (message: string, context?: LogContext, error?: unknown) => {
    const entry = createLogEntry(LogLevel.WARN, message, context, error);
    outputLog(entry);
  },

  error: (message: string, error?: unknown, context?: LogContext) => {
    const entry = createLogEntry(LogLevel.ERROR, message, context, error);
    outputLog(entry);
  },
};

export default logger;
