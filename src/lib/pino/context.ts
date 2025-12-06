/**
 * Pino logger context and correlation utilities
 */
import { Logger } from 'pino';

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

export function createChildLogger(
  baseLogger: Logger,
  context: LogContext
): Logger {
  const contextData: Record<string, any> = {};

  if (context.userId) contextData.userId = context.userId;
  if (context.sessionId) contextData.sessionId = context.sessionId;
  if (context.requestId) contextData.requestId = context.requestId;
  if (context.endpoint) contextData.endpoint = context.endpoint;
  if (context.method) contextData.method = context.method;
  if (context.userAgent) contextData.userAgent = context.userAgent;
  if (context.ip) contextData.ip = context.ip;
  if (context.duration) contextData.duration = context.duration;
  if (context.statusCode) contextData.statusCode = context.statusCode;
  if (context.errorCode) contextData.errorCode = context.errorCode;

  return baseLogger.child(contextData);
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class RequestTracker {
  private static activeRequests = new Map<
    string,
    { startTime: number; context: LogContext }
  >();

  static startRequest(requestId: string, context: LogContext = {}): void {
    this.activeRequests.set(requestId, {
      startTime: Date.now(),
      context,
    });
  }

  static endRequest(requestId: string): LogContext | null {
    const request = this.activeRequests.get(requestId);
    if (!request) return null;

    const duration = Date.now() - request.startTime;
    this.activeRequests.delete(requestId);

    return {
      ...request.context,
      requestId,
      duration,
    };
  }

  static getActiveRequests(): number {
    return this.activeRequests.size;
  }

  static cleanup(): void {
    const now = Date.now();
    const timeoutMs = 5 * 60 * 1000; // 5 minutes

    for (const [id, request] of this.activeRequests.entries()) {
      if (now - request.startTime > timeoutMs) {
        this.activeRequests.delete(id);
      }
    }
  }
}

// Auto-cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => RequestTracker.cleanup(), 60000);
}
