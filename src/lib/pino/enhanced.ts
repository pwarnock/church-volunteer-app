/**
 * Enhanced Pino logger wrapper with correlation tracking
 */
import { baseLogger } from './config.js';
import {
  LogContext,
  createChildLogger,
  generateRequestId,
  RequestTracker,
} from './context.js';
import { Logger } from 'pino';

class EnhancedLogger {
  private logger: Logger;
  private context: LogContext = {};

  constructor(context: LogContext = {}) {
    this.context = context;
    this.logger = createChildLogger(baseLogger, context);
  }

  // Update context
  updateContext(newContext: Partial<LogContext>): EnhancedLogger {
    const updatedContext = { ...this.context, ...newContext };
    return new EnhancedLogger(updatedContext);
  }

  // Logging methods
  info(message: string, metadata?: Record<string, any>): void {
    this.logger.info({ ...metadata }, message);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn({ ...metadata }, message);
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.logger.error(
      {
        ...metadata,
        err: error,
        errorMessage: error?.message,
        errorName: error?.name,
      },
      message
    );
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.logger.debug({ ...metadata }, message);
  }

  // Request logging
  logRequest(context: LogContext, metadata?: Record<string, any>): void {
    const requestId = context.requestId || generateRequestId();
    RequestTracker.startRequest(requestId, context);

    this.info('Request started', {
      requestId,
      ...context,
      ...metadata,
    });
  }

  logResponse(
    requestId: string,
    statusCode: number,
    metadata?: Record<string, any>
  ): void {
    const context = RequestTracker.endRequest(requestId);
    const statusCategory =
      statusCode < 400
        ? 'success'
        : statusCode < 500
          ? 'client_error'
          : 'server_error';

    this.info('Request completed', {
      requestId,
      statusCode,
      statusCategory,
      ...context,
      ...metadata,
    });
  }

  // Performance logging
  logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const performanceLevel =
      duration < 100 ? 'fast' : duration < 1000 ? 'medium' : 'slow';

    this.info(`Performance: ${operation}`, {
      operation,
      duration,
      performanceLevel,
      ...metadata,
    });
  }

  // Create child logger with additional context
  child(context: LogContext): EnhancedLogger {
    const combinedContext = { ...this.context, ...context };
    return new EnhancedLogger(combinedContext);
  }

  // Get underlying pino logger
  getPinoLogger(): Logger {
    return this.logger;
  }

  // Flush any buffered logs
  async flush(): Promise<void> {
    // Pino has built-in async flushing, this is a no-op
    return Promise.resolve();
  }
}

// Export singleton instance with no context
export const logger = new EnhancedLogger();

// Export factory functions
export function createLogger(context?: LogContext): EnhancedLogger {
  return new EnhancedLogger(context);
}

export function createRequestLogger(
  requestId: string,
  context: LogContext = {}
): EnhancedLogger {
  const fullContext = { ...context, requestId };
  return new EnhancedLogger(fullContext);
}
