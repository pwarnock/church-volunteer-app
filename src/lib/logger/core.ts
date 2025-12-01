/**
 * Core Logger implementation
 */
import { 
  LogEntry, 
  LogLevel, 
  LoggerConfig, 
  LoggerInstance, 
  LogTransport,
  ErrorInfo,
  ErrorCategory,
  ErrorSeverity
} from './types.js';
import { ErrorTracker, categorizeError, sanitizeForLogging } from './tracker.js';
import { ConsoleFormatter, JsonFormatter, StructuredFormatter, PinoFormatter } from './formatters.js';

export class Logger implements LoggerInstance {
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private errorTracker: ErrorTracker;
  private metadata: Record<string, any> = {};

  constructor(config: LoggerConfig) {
    this.config = config;
    this.errorTracker = new ErrorTracker();
    this.setupTransports();
  }

  private setupTransports(): void {
    // Console transport (always added)
    this.transports.push({
      name: 'console',
      level: this.config.level,
      write: (entry) => this.writeToConsole(entry)
    });

    // Custom transports
    if (this.config.customTransports) {
      this.transports.push(...this.config.customTransports);
    }

    // External service transport
    if (this.config.externalService) {
      this.setupExternalTransport();
    }
  }

  private setupExternalTransport(): void {
    if (!this.config.externalService) return;

    const { name, config } = this.config.externalService;
    
    this.transports.push({
      name: `external-${name}`,
      level: LogLevel.WARN, // Only send warnings and errors to external services
      write: async (entry) => {
        try {
          switch (name) {
            case 'sentry':
              await this.sendToSentry(entry, config);
              break;
            case 'logfire':
              await this.sendToLogfire(entry, config);
              break;
            case 'datadog':
              await this.sendToDataDog(entry, config);
              break;
            case 'cloudwatch':
              await this.sendToCloudWatch(entry, config);
              break;
          }
        } catch (error) {
          console.error('Failed to send to external service:', error);
        }
      }
    });
  }

  private writeToConsole(entry: LogEntry): void {
    let message: string;
    
    if (this.config.enableStructuredOutput) {
      const formatter = new StructuredFormatter();
      message = formatter.format(entry);
    } else if (this.config.enableColors) {
      const formatter = new ConsoleFormatter(true, this.config.enableTimestamps);
      message = formatter.format(entry);
    } else {
      const formatter = new JsonFormatter();
      message = formatter.format(entry);
    }

    // Write to appropriate console method
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      default:
        console.log(message);
    }
  }

  error(message: string, info?: Partial<ErrorInfo>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message);
    
    if (info?.error) {
      const { category, severity } = categorizeError(info.error);
      entry.category = info.category || category;
      entry.severity = info.severity || severity;
      entry.stackTrace = this.config.enableStackTrace ? info.error.stack : undefined;
      entry.metadata = {
        ...entry.metadata,
        errorName: info.error.name,
        errorMessage: info.error.message,
        ...info.context
      };
    } else if (info) {
      entry.category = info.category;
      entry.severity = info.severity;
    }

    if (info) {
      entry.userId = info.userId || entry.userId;
      entry.sessionId = info.sessionId || entry.sessionId;
      entry.requestId = info.requestId || entry.requestId;
      entry.tags = info.tags || entry.tags;
    }

    // Track error
    this.errorTracker.recordError(entry);
    
    this.write(entry);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message);
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...sanitizeForLogging(metadata) };
    }
    this.write(entry);
  }

  info(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message);
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...sanitizeForLogging(metadata) };
    }
    this.write(entry);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message);
    if (metadata) {
      entry.metadata = { ...entry.metadata, ...sanitizeForLogging(metadata) };
    }
    this.write(entry);
  }

  child(metadata: Record<string, any>): LoggerInstance {
    const child = new Logger(this.config);
    child.metadata = { ...this.metadata, ...metadata };
    return child;
  }

  async flush(): Promise<void> {
    const promises = this.transports
      .filter(transport => transport.name.includes('external'))
      .map(async (transport) => {
        // In a real implementation, you'd batch and flush pending logs
        // For now, just ensure all async writes complete
      });
    
    await Promise.all(promises);
  }

  private createLogEntry(level: LogLevel, message: string): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: { ...this.metadata }
    };
  }

  private write(entry: LogEntry): void {
    // Only write if level is enabled
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Write to all transports
    this.transports.forEach(transport => {
      if (this.shouldLogForTransport(transport, entry.level)) {
        try {
          transport.write(entry);
        } catch (error) {
          console.error(`Transport ${transport.name} failed:`, error);
        }
      }
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private shouldLogForTransport(transport: LogTransport, level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const transportLevelIndex = levels.indexOf(transport.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= transportLevelIndex;
  }

  // External service integrations (simplified)
  private async sendToSentry(entry: LogEntry, config: Record<string, any>): Promise<void> {
    // Simplified Sentry integration
    // In real implementation, you'd use @sentry/node
    console.log('Would send to Sentry:', { entry, config });
  }

  private async sendToLogfire(entry: LogEntry, config: Record<string, any>): Promise<void> {
    // Simplified Logfire integration
    // In real implementation, you'd use their API
    console.log('Would send to Logfire:', { entry, config });
  }

  private async sendToDataDog(entry: LogEntry, config: Record<string, any>): Promise<void> {
    // Simplified DataDog integration
    // In real implementation, you'd use their API
    console.log('Would send to DataDog:', { entry, config });
  }

  private async sendToCloudWatch(entry: LogEntry, config: Record<string, any>): Promise<void> {
    // Simplified CloudWatch integration
    // In real implementation, you'd use AWS SDK
    console.log('Would send to CloudWatch:', { entry, config });
  }

  // Public API for accessing metrics
  getMetrics() {
    return this.errorTracker.getMetrics();
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.setupTransports();
  }
}