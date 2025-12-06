/**
 * Error tracking and metrics utilities
 */
import {
  LogEntry,
  ErrorCategory,
  ErrorSeverity,
  ErrorMetrics,
} from './types.js';

export class ErrorTracker {
  private errors: LogEntry[] = [];
  private errorCounts: Map<string, number> = new Map();
  private maxHistorySize = 1000;
  private retentionMs = 24 * 60 * 60 * 1000; // 24 hours

  recordError(entry: LogEntry): void {
    // Add to history
    this.errors.push(entry);

    // Update counts
    const key = `${entry.category}:${entry.message}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

    // Clean up old errors
    this.cleanup();
  }

  getMetrics(): ErrorMetrics {
    const errorsByCategory = {} as Record<ErrorCategory, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;
    let totalErrors = 0;

    this.errors.forEach((error) => {
      if (error.category) {
        errorsByCategory[error.category] =
          (errorsByCategory[error.category] || 0) + 1;
      }
      if (error.severity) {
        errorsBySeverity[error.severity] =
          (errorsBySeverity[error.severity] || 0) + 1;
      }
      totalErrors++;
    });

    // Get top errors
    const topErrors = Array.from(this.errorCounts.entries())
      .map(([key, count]) => {
        const [category, ...messageParts] = key.split(':');
        const message = messageParts.join(':');
        const relatedErrors = this.errors.filter(
          (e) =>
            e.category === (category as ErrorCategory) && e.message === message
        );
        const lastOccurred = Math.max(
          ...relatedErrors.map((e) => new Date(e.timestamp).getTime())
        );

        return {
          message: `${category}: ${message}`,
          count,
          lastOccurred: new Date(lastOccurred).toISOString(),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errors.slice(-20).reverse(),
      topErrors,
    };
  }

  private cleanup(): void {
    const now = Date.now();

    // Remove old errors
    this.errors = this.errors.filter(
      (error) => now - new Date(error.timestamp).getTime() < this.retentionMs
    );

    // Limit history size
    if (this.errors.length > this.maxHistorySize) {
      this.errors = this.errors.slice(-this.maxHistorySize);
    }

    // Clean up error counts for old errors
    const activeKeys = new Set(
      this.errors.map((e) => `${e.category}:${e.message}`)
    );
    for (const key of this.errorCounts.keys()) {
      if (!activeKeys.has(key)) {
        this.errorCounts.delete(key);
      }
    }
  }

  clear(): void {
    this.errors = [];
    this.errorCounts.clear();
  }
}

export function categorizeError(error: Error): {
  category: ErrorCategory;
  severity: ErrorSeverity;
} {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Database errors
  if (
    message.includes('database') ||
    message.includes('sql') ||
    message.includes('connection') ||
    stack.includes('prisma')
  ) {
    return {
      category: ErrorCategory.DATABASE_CONNECTION,
      severity: ErrorSeverity.HIGH,
    };
  }

  // Authentication errors
  if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('authentication') ||
    message.includes('login')
  ) {
    return {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  // Network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('connection')
  ) {
    return {
      category: ErrorCategory.NETWORK_TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
    };
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('missing')
  ) {
    return {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
    };
  }

  // Security errors
  if (
    message.includes('security') ||
    message.includes('suspicious') ||
    message.includes('attack') ||
    message.includes('malicious')
  ) {
    return {
      category: ErrorCategory.SECURITY,
      severity: ErrorSeverity.CRITICAL,
    };
  }

  // Default to internal server error
  return {
    category: ErrorCategory.INTERNAL_SERVER,
    severity: ErrorSeverity.MEDIUM,
  };
}

export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'authorization',
    'cookie',
    'session',
    'csrf',
    'jwt',
    'bearer',
  ];

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForLogging(item));
  }

  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}
