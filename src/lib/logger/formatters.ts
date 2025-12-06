/**
 * Log formatting utilities
 */
import { LogEntry, LogLevel, LogFormatter } from './types.js';

export class ConsoleFormatter {
  private enableColors: boolean;
  private enableTimestamps: boolean;

  constructor(enableColors = true, enableTimestamps = true) {
    this.enableColors = enableColors;
    this.enableTimestamps = enableTimestamps;
  }

  format(entry: LogEntry): string {
    const parts: string[] = [];

    // Timestamp
    if (this.enableTimestamps) {
      const timestamp = new Date(entry.timestamp).toISOString();
      parts.push(`[${timestamp}]`);
    }

    // Log level (with colors)
    const levelStr = entry.level.toUpperCase().padEnd(5);
    if (this.enableColors) {
      parts.push(this.colorizeLevel(entry.level, levelStr));
    } else {
      parts.push(levelStr);
    }

    // Category and Severity
    if (entry.category) {
      parts.push(`[${entry.category}]`);
    }
    if (entry.severity) {
      parts.push(`[${entry.severity}]`);
    }

    // Context info
    if (entry.userId) {
      parts.push(`[user:${entry.userId}]`);
    }
    if (entry.sessionId) {
      parts.push(`[session:${entry.sessionId}]`);
    }
    if (entry.requestId) {
      parts.push(`[req:${entry.requestId}]`);
    }

    // Message
    parts.push(entry.message);

    // Metadata
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      parts.push(`\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}`);
    }

    // Stack trace for errors
    if (entry.stackTrace) {
      parts.push(`\n${entry.stackTrace}`);
    }

    return parts.join(' ');
  }

  private colorizeLevel(level: LogLevel, text: string): string {
    const colors = {
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.INFO]: '\x1b[36m', // Cyan
      [LogLevel.DEBUG]: '\x1b[90m', // Gray
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';
    return `${color}${text}${reset}`;
  }
}

export class JsonFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }
}

export class StructuredFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const parts: string[] = [];

    // Main log info
    parts.push(`level=${entry.level}`);
    parts.push(`msg="${entry.message}"`);
    parts.push(`timestamp=${entry.timestamp}`);

    // Optional fields
    if (entry.category) parts.push(`category=${entry.category}`);
    if (entry.severity) parts.push(`severity=${entry.severity}`);
    if (entry.userId) parts.push(`user_id=${entry.userId}`);
    if (entry.sessionId) parts.push(`session_id=${entry.sessionId}`);
    if (entry.requestId) parts.push(`request_id=${entry.requestId}`);

    // Tags
    if (entry.tags && entry.tags.length > 0) {
      parts.push(`tags=${entry.tags.join(',')}`);
    }

    // Metadata as key-value pairs
    if (entry.metadata) {
      for (const [key, value] of Object.entries(entry.metadata)) {
        parts.push(`${key}=${JSON.stringify(value)}`);
      }
    }

    return parts.join(' ');
  }
}

export class PinoFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const pinoEntry: any = {
      level: this.getPinoLevel(entry.level),
      time: new Date(entry.timestamp).getTime(),
      msg: entry.message,
    };

    // Add optional fields
    if (entry.category) pinoEntry.category = entry.category;
    if (entry.severity) pinoEntry.severity = entry.severity;
    if (entry.userId) pinoEntry.userId = entry.userId;
    if (entry.sessionId) pinoEntry.sessionId = entry.sessionId;
    if (entry.requestId) pinoEntry.requestId = entry.requestId;
    if (entry.tags && entry.tags.length > 0) pinoEntry.tags = entry.tags;
    if (entry.metadata) pinoEntry = { ...pinoEntry, ...entry.metadata };
    if (entry.stackTrace) pinoEntry.stack = entry.stackTrace;

    return JSON.stringify(pinoEntry);
  }

  private getPinoLevel(level: LogLevel): number {
    switch (level) {
      case LogLevel.ERROR:
        return 50;
      case LogLevel.WARN:
        return 40;
      case LogLevel.INFO:
        return 30;
      case LogLevel.DEBUG:
        return 20;
      default:
        return 30;
    }
  }
}
