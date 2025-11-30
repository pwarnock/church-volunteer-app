/**
 * Pino Logger Configuration
 * 
 * High-performance structured logging with:
 * - JSON output in production
 * - Pretty printing in development
 * - Request correlation
 * - Error tracking
 * - Performance monitoring
 */

import pino, { Logger } from 'pino';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Log level configuration
const logLevel = process.env.LOG_LEVEL || (
  isTest ? 'silent' : 
  isDevelopment ? 'debug' : 
  'info'
);

// Base logger configuration
const loggerConfig = {
  level: logLevel,
  formatters: {
    // Custom formatter for log levels
    level(label: string) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Don't serialize Error objects, let pino handle it
  serializers: {
    err: pino.stdSerializers.err,
  },
};

// Create base logger
const baseLogger = pino(loggerConfig);

// Development pretty logger
const developmentLogger = pino({
  ...loggerConfig,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      messageFormat: '{reqId} [{level}] {msg}',
      customPrettifiers: {
        // Pretty print error objects
        err: (error: any) => {
          if (!error) return '';
          return `${error.name}: ${error.message}`;
        },
      },
    },
  },
});

// Production logger (JSON output)
const productionLogger = pino({
  ...loggerConfig,
  // Add production-specific fields
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'unknown',
    service: 'church-volunteer-app',
    version: process.env.npm_package_version || '1.0.0',
  },
});

// Select appropriate logger
const pino = isDevelopment ? developmentLogger : productionLogger;

/**
 * Enhanced logger with correlation and context tracking
 */
export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  duration?: number;
  statusCode?: number;
  errorCode?: string;
  [key: string]: unknown;
}

/**
 * Logger wrapper with correlation tracking
 */
export const logger = {
  debug: (message: string, context?: LogContext, error?: Error | unknown) => {
    pino.debug(
      { 
        ...context, 
        ...(error && { err: error }) 
      }, 
      message
    );
  },

  info: (message: string, context?: LogContext) => {
    pino.info(context, message);
  },

  warn: (message: string, context?: LogContext, error?: Error | unknown) => {
    pino.warn(
      { 
        ...context, 
        ...(error && { err: error }) 
      }, 
      message
    );
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    pino.error(
      { 
        ...context, 
        ...(error && { err: error }) 
      }, 
      message
    );
  },

  fatal: (message: string, error?: Error | unknown, context?: LogContext) => {
    pino.fatal(
      { 
        ...context, 
        ...(error && { err: error }) 
      }, 
      message
    );
  },
};

/**
 * Create child logger with correlation context
 */
export function createChildLogger(context: LogContext): Logger {
  return pino.child(context);
}

/**
 * Request correlation middleware
 */
export function createRequestLogger(requestId: string) {
  const child = pino.child({ requestId });
  
  return {
    debug: (message: string, context?: LogContext) => 
      child.debug(context, message),
    info: (message: string, context?: LogContext) => 
      child.info(context, message),
    warn: (message: string, context?: LogContext, error?: Error) => 
      child.warn({ ...context, err: error }, message),
    error: (message: string, error?: Error, context?: LogContext) => 
      child.error({ ...context, err: error }, message),
  };
}

/**
 * Performance tracking
 */
export function trackPerformance(operation: string, startTime: number, context?: LogContext) {
  const duration = performance.now() - startTime;
  
  pino.info({
    operation,
    duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
    ...context,
  }, `Performance: ${operation} completed in ${duration.toFixed(2)}ms`);
}

/**
 * API request logging
 */
export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: LogContext
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  pino[level]({
    method,
    url,
    statusCode,
    duration: Math.round(duration * 100) / 100,
    ...context,
  }, `API ${method} ${url} - ${statusCode} (${duration.toFixed(2)}ms)`);
}

/**
 * User action tracking
 */
export function trackUserAction(action: string, context: LogContext) {
  pino.info({
    action,
    category: 'user_action',
    ...context,
  }, `User action: ${action}`);
}

/**
 * API error tracking with categorization
 */
export function trackApiError(
  error: Error | unknown,
  context: LogContext & { endpoint?: string; method?: string; statusCode?: number }
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : 'UnknownError';
  
  // Determine error category for better monitoring
  const errorCategory = categorizeError(errorMessage);
  
  pino.error({
    err: error,
    errorName,
    errorMessage,
    category: errorCategory.category,
    severity: errorCategory.severity,
    isUserFacing: errorCategory.isUserFacing,
    requiresAlert: errorCategory.requiresAlert,
    ...context,
  }, `API Error: ${errorMessage}`);
}

/**
 * Error categorization for monitoring
 */
function categorizeError(message: string) {
  // Authentication errors
  if (message.includes('Unauthorized') || message.includes('Invalid credentials')) {
    return {
      category: 'AUTHENTICATION',
      severity: 'MEDIUM',
      isUserFacing: true,
      requiresAlert: true,
    };
  }

  // Authorization errors
  if (message.includes('Forbidden') || message.includes('Access denied')) {
    return {
      category: 'AUTHORIZATION', 
      severity: 'MEDIUM',
      isUserFacing: true,
      requiresAlert: true,
    };
  }

  // Database errors
  if (message.includes('Database connection') || message.includes('connection timeout')) {
    return {
      category: 'DATABASE_CONNECTION',
      severity: 'HIGH',
      isUserFacing: true,
      requiresAlert: true,
    };
  }

  // Validation errors
  if (message.includes('validation') || message.includes('Invalid')) {
    return {
      category: 'VALIDATION',
      severity: 'LOW',
      isUserFacing: true,
      requiresAlert: false,
    };
  }

  // Default categorization
  return {
    category: 'UNKNOWN',
    severity: 'MEDIUM',
    isUserFacing: true,
    requiresAlert: true,
  };
}

/**
 * Security event tracking
 */
export function trackSecurityEvent(event: string, context: LogContext) {
  pino.warn({
    event,
    category: 'security',
    ...context,
  }, `Security event: ${event}`);
}

/**
 * Rate limiting tracking
 */
export function trackRateLimit(
  identifier: string,
  endpoint: string,
  context?: LogContext
) {
  pino.warn({
    identifier,
    endpoint,
    category: 'rate_limit',
    ...context,
  }, `Rate limit exceeded for ${identifier} on ${endpoint}`);
}

// Export the raw pino logger for advanced usage
export { pino as rawPinoLogger };

// Export logger type for TypeScript
export type { Logger };