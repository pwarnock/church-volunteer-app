/**
 * Pino logger configuration and setup
 */
import pino, { Logger } from 'pino';

export interface PinoConfig {
  level?: string;
  prettyPrint?: boolean;
  serviceName?: string;
  version?: string;
  hostname?: string;
}

export function createPinoLogger(config: PinoConfig = {}): Logger {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  
  // Log level configuration
  const logLevel = config.level || process.env.LOG_LEVEL || (
    isTest ? 'silent' : 
    isDevelopment ? 'debug' : 
    'info'
  );

  // Base configuration
  const baseConfig = {
    level: logLevel,
    formatters: {
      level(label: string) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      err: pino.stdSerializers.err,
    },
  };

  // Development logger with pretty printing
  if (isDevelopment && config.prettyPrint !== false) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          messageFormat: '{reqId} [{level}] {msg}',
          customPrettifiers: {
            err: (error: any) => {
              if (!error) return '';
              return `${error.name}: ${error.message}`;
            },
          },
        },
      },
    });
  }

  // Production logger with structured output
  return pino({
    ...baseConfig,
    base: {
      pid: process.pid,
      hostname: config.hostname || process.env.HOSTNAME || 'unknown',
      service: config.serviceName || 'church-volunteer-app',
      version: config.version || process.env.npm_package_version || '1.0.0',
    },
  });
}

// Create default logger instance
export const baseLogger = createPinoLogger();