/**
 * Centralized logging utility with error categorization and tracking
 * Structured logging for development and production
 *
 * Can be integrated with external services like:
 * - Pydantic Logfire (via API endpoint)
 * - Sentry
 * - DataDog
 * - CloudWatch
 */

export enum ErrorCategory {
  // Authentication Errors
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Database Errors
  DATABASE_CONNECTION = 'DATABASE_CONNECTION',
  DATABASE_VALIDATION = 'DATABASE_VALIDATION',
  DATABASE_CONSTRAINT = 'DATABASE_CONSTRAINT',
  
  // Network Errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  
  // Business Logic Errors
  VALIDATION = 'VALIDATION',
  BUSINESS_RULE = 'BUSINESS_RULE',
  
  // System Errors
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  CONFIGURATION = 'CONFIGURATION',
  RATE_LIMIT = 'RATE_LIMIT',
  
  // External Service Errors
  EXTERNAL_API = 'EXTERNAL_API',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  
  // Client Errors
  CLIENT_ERROR = 'CLIENT_ERROR',
  MALFORMED_REQUEST = 'MALFORMED_REQUEST',
  
  // Security Errors
  SECURITY = 'SECURITY',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface ErrorClassification {
  category: ErrorCategory;
  severity: ErrorSeverity;
  isUserFacing: boolean;
  requiresAlert: boolean;
  suggestedAction?: string;
}

interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  errorCode?: string;
  errorCategory?: string;
  severity?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  category?: string;
  severity?: string;
  isUserFacing?: boolean;
  requiresAlert?: boolean;
  suggestedAction?: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Error classification rules
 */
function classifyError(
  error: Error | string, 
  endpoint?: string, 
  method?: string, 
  statusCode?: number
): ErrorClassification {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorName = typeof error === 'string' ? 'Error' : error.name;

  // Authentication errors
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid credentials')) {
    return {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      isUserFacing: true,
      requiresAlert: true,
      suggestedAction: 'Please check your credentials and try again',
    };
  }

  if (errorMessage.includes('Forbidden') || errorMessage.includes('Access denied')) {
    return {
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      isUserFacing: true,
      requiresAlert: true,
      suggestedAction: 'You do not have permission to perform this action',
    };
  }

  if (errorMessage.includes('Session expired')) {
    return {
      category: ErrorCategory.SESSION_EXPIRED,
      severity: ErrorSeverity.LOW,
      isUserFacing: true,
      requiresAlert: false,
      suggestedAction: 'Please sign in again to continue',
    };
  }

  // Database errors
  if (errorMessage.includes('Database connection') || errorMessage.includes('connection timeout')) {
    return {
      category: ErrorCategory.DATABASE_CONNECTION,
      severity: ErrorSeverity.HIGH,
      isUserFacing: true,
      requiresAlert: true,
      suggestedAction: 'Please try again in a few moments',
    };
  }

  if (errorMessage.includes('constraint violation') || errorMessage.includes('unique constraint')) {
    return {
      category: ErrorCategory.DATABASE_CONSTRAINT,
      severity: ErrorSeverity.MEDIUM,
      isUserFacing: true,
      requiresAlert: false,
      suggestedAction: 'This record already exists or conflicts with existing data',
    };
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return {
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.LOW,
      isUserFacing: true,
      requiresAlert: false,
      suggestedAction: 'Please wait a moment before trying again',
    };
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid input')) {
    return {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      isUserFacing: true,
      requiresAlert: false,
      suggestedAction: 'Please check your input and try again',
    };
  }

  // External API errors
  if (errorMessage.includes('external service') || errorMessage.includes('third party')) {
    return {
      category: ErrorCategory.EXTERNAL_API,
      severity: ErrorSeverity.MEDIUM,
      isUserFacing: true,
      requiresAlert: true,
      suggestedAction: 'Service temporarily unavailable, please try again later',
    };
  }

  // Security errors
  if (errorMessage.includes('CSRF') || errorMessage.includes('XSS') || errorMessage.includes('suspicious')) {
    return {
      category: ErrorCategory.SECURITY,
      severity: ErrorSeverity.HIGH,
      isUserFacing: false,
      requiresAlert: true,
      suggestedAction: 'Security violation detected and logged',
    };
  }

  // Default classification
  return {
    category: ErrorCategory.INTERNAL_SERVER,
    severity: ErrorSeverity.MEDIUM,
    isUserFacing: true,
    requiresAlert: true,
    suggestedAction: 'An unexpected error occurred. Please try again later',
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
 * Create a log entry with error classification
 */
function createLogEntry(
  level: string,
  message: string,
  context?: LogContext,
  error?: unknown,
  endpoint?: string,
  method?: string,
  statusCode?: number
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = formatError(error);
    
    // Classify the error
    const classification = classifyError(
      typeof error === 'string' ? error : error, 
      endpoint, 
      method, 
      statusCode
    );
    
    entry.category = classification.category;
    entry.severity = classification.severity;
    entry.isUserFacing = classification.isUserFacing;
    entry.requiresAlert = classification.requiresAlert;
    entry.suggestedAction = classification.suggestedAction;
    
    // Add classification to context
    if (entry.context) {
      entry.context.errorCategory = classification.category;
      entry.context.severity = classification.severity;
    }
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
  // Send error alerts if required
  if (entry.requiresAlert && entry.level === 'ERROR') {
    await sendErrorAlert(entry);
  }

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
          category: entry.category,
          severity: entry.severity,
          isUserFacing: entry.isUserFacing,
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
          category: entry.category,
          severity: entry.severity,
          isUserFacing: entry.isUserFacing,
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
 * Send error alert to configured channels
 */
async function sendErrorAlert(entry: LogEntry) {
  const alertPayload = {
    title: `🚨 ${entry.category} Error`,
    text: `${entry.message}\n\n**Severity:** ${entry.severity}\n**Category:** ${entry.category}\n**Endpoint:** ${entry.context?.endpoint}\n**User:** ${entry.context?.userId}`,
    priority: entry.severity === ErrorSeverity.CRITICAL ? 'high' : 
              entry.severity === ErrorSeverity.HIGH ? 'high' : 'normal',
  };

  // Slack alert
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertPayload),
      });
    } catch (error) {
      logger.error('Failed to send Slack alert', error);
    }
  }

  // Email alert for critical errors
  if (entry.severity === ErrorSeverity.CRITICAL && process.env.ERROR_EMAIL_TO) {
    try {
      // Implementation depends on email service (e.g., SendGrid, AWS SES)
      await fetch('/api/alerts/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: process.env.ERROR_EMAIL_TO,
          subject: alertPayload.title,
          body: alertPayload.text,
        }),
      });
    } catch (error) {
      logger.error('Failed to send email alert', error);
    }
  }
}

/**
 * Logger interface with error categorization
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

  warn: (message: string, context?: LogContext, error?: unknown, options?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
  }) => {
    const entry = createLogEntry('WARN', message, context, error, options?.endpoint, options?.method, options?.statusCode);
    outputLog(entry);
  },

  error: (message: string, error?: unknown, context?: LogContext, options?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
  }) => {
    const entry = createLogEntry('ERROR', message, context, error, options?.endpoint, options?.method, options?.statusCode);
    outputLog(entry);
  },
};

/**
 * Track authenticated user actions
 */
export const trackUserAction = (action: string, context: LogContext) => {
  logger.info(`User action: ${action}`, {
    ...context,
    action,
    category: 'USER_ACTION',
  });
};

/**
 * Track API errors with context
 */
export const trackApiError = (error: unknown, context: {
  endpoint: string;
  method: string;
  statusCode?: number;
  userId?: string;
}) => {
  logger.error('API error', error, {
    userId: context.userId,
    endpoint: context.endpoint,
    method: context.method,
    errorCode: context.statusCode?.toString(),
  }, context);
};

/**
 * Track security events
 */
export const trackSecurityEvent = (event: string, context: LogContext) => {
  logger.warn(`Security event: ${event}`, context, undefined, {
    category: ErrorCategory.SECURITY,
  });
};

export default logger;
