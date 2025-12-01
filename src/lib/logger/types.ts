/**
 * Logger type definitions and enums
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

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface ErrorInfo {
  error: Error;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  tags?: string[];
}

export interface LoggerConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamps: boolean;
  enableStackTrace: boolean;
  enableStructuredOutput: boolean;
  externalService?: {
    name: 'sentry' | 'logfire' | 'datadog' | 'cloudwatch';
    config: Record<string, any>;
  };
  customTransports?: LogTransport[];
}

export interface LogTransport {
  name: string;
  level: LogLevel;
  write: (entry: LogEntry) => void | Promise<void>;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  recentErrors: LogEntry[];
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurred: string;
  }>;
}

export interface LoggerInstance {
  error: (message: string, info?: Partial<ErrorInfo>) => void;
  warn: (message: string, metadata?: Record<string, any>) => void;
  info: (message: string, metadata?: Record<string, any>) => void;
  debug: (message: string, metadata?: Record<string, any>) => void;
  child: (metadata: Record<string, any>) => LoggerInstance;
  flush: () => Promise<void>;
}

export type LogFilter = (entry: LogEntry) => boolean;
export type LogFormatter = (entry: LogEntry) => string;
export type LogMiddleware = (entry: LogEntry, next: () => void) => void;