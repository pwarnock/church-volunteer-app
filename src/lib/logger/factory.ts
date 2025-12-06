/**
 * Logger factory and default configuration
 */
import { Logger } from './core.js';
import { LogLevel, LoggerConfig } from './types.js';

export class LoggerFactory {
  private static defaultConfig: LoggerConfig = {
    level: LogLevel.INFO,
    enableColors: true,
    enableTimestamps: true,
    enableStackTrace: true,
    enableStructuredOutput: false,
  };

  private static instance?: Logger;

  static create(config?: Partial<LoggerConfig>): Logger {
    const fullConfig = { ...LoggerFactory.defaultConfig, ...config };

    // Set environment-based defaults
    if (typeof window === 'undefined') {
      // Server environment
      const nodeEnv = process.env.NODE_ENV || 'development';

      if (nodeEnv === 'production') {
        fullConfig.level = LogLevel.WARN;
        fullConfig.enableColors = false;
        fullConfig.enableStructuredOutput = true;
        fullConfig.enableStackTrace = false;
      } else if (nodeEnv === 'test') {
        fullConfig.level = LogLevel.ERROR;
        fullConfig.enableColors = false;
        fullConfig.enableStructuredOutput = true;
      }

      // Check for external service configuration
      if (process.env.SENTRY_DSN) {
        fullConfig.externalService = {
          name: 'sentry',
          config: { dsn: process.env.SENTRY_DSN },
        };
      }
    } else {
      // Browser environment
      fullConfig.level = LogLevel.INFO;
      fullConfig.enableColors = false;
      fullConfig.enableStructuredOutput = true;
      fullConfig.enableStackTrace = false;
    }

    return new Logger(fullConfig);
  }

  static createProduction(config?: Partial<LoggerConfig>): Logger {
    return this.create({
      ...config,
      level: LogLevel.WARN,
      enableColors: false,
      enableStructuredOutput: true,
      enableStackTrace: false,
    });
  }

  static createDevelopment(config?: Partial<LoggerConfig>): Logger {
    return this.create({
      ...config,
      level: LogLevel.DEBUG,
      enableColors: true,
      enableStructuredOutput: false,
      enableStackTrace: true,
    });
  }

  static createTest(config?: Partial<LoggerConfig>): Logger {
    return this.create({
      ...config,
      level: LogLevel.ERROR,
      enableColors: false,
      enableStructuredOutput: true,
      enableStackTrace: false,
    });
  }

  // Singleton instance for convenience
  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!LoggerFactory.instance) {
      LoggerFactory.instance = LoggerFactory.create(config);
    }
    return LoggerFactory.instance;
  }

  // Reset singleton (useful for testing)
  static resetInstance(): void {
    LoggerFactory.instance = undefined;
  }
}

// Create default exports
export const logger = LoggerFactory.create();
export const createLogger = LoggerFactory.create;
export const createProductionLogger = LoggerFactory.createProduction;
export const createDevelopmentLogger = LoggerFactory.createDevelopment;
export const createTestLogger = LoggerFactory.createTest;
export const getLoggerInstance = LoggerFactory.getInstance;
