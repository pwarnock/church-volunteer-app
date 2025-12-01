/**
 * Logger - Centralized logging utility with error categorization and tracking
 * 
 * A comprehensive logging system that provides structured logging with:
 * - Error categorization and tracking
 * - Multiple output formats (console, JSON, structured)
 * - External service integrations (Sentry, Logfire, DataDog, CloudWatch)
 * - Performance metrics and error analytics
 * - Environment-aware configuration
 */

// Export main types and interfaces
export * from './types.js';

// Export core functionality
export { Logger } from './core.js';

// Export factory and convenience exports
export { 
  LoggerFactory,
  logger,
  createLogger,
  createProductionLogger,
  createDevelopmentLogger,
  createTestLogger,
  getLoggerInstance
} from './factory.js';

// Export utilities
export { ErrorTracker, categorizeError, sanitizeForLogging } from './tracker.js';
export { 
  ConsoleFormatter, 
  JsonFormatter, 
  StructuredFormatter, 
  PinoFormatter 
} from './formatters.js';

// Re-export common enums for backward compatibility
export {
  ErrorCategory,
  ErrorSeverity,
  LogLevel
} from './types.js';