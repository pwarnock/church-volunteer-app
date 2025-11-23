/**
 * API middleware utilities for request/response handling
 * Provides decorators and wrappers for common API patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * Wrap an API route handler with error handling and logging
 */
export function withErrorHandling<
  T extends (...args: unknown[]) => Promise<NextResponse>,
>(handler: T, routeName: string) {
  return async (...args: unknown[]): Promise<NextResponse> => {
    const request = args[0] as NextRequest;
    const method = request.method || 'UNKNOWN';
    const pathname = request.nextUrl.pathname;
    const startTime = Date.now();

    try {
      logger.debug(`${method} ${pathname}`, { routeName });
      const response = await handler(...args);
      const duration = Date.now() - startTime;

      logger.info(`${method} ${pathname} ${response.status}`, {
        routeName,
        method,
        pathname,
        status: response.status,
        duration: `${duration}ms`,
      });

      // Add performance headers
      const newResponse = new NextResponse(response.body, response);
      newResponse.headers.set('X-Response-Time', `${duration}ms`);
      return newResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${method} ${pathname} error`, error, {
        routeName,
        method,
        pathname,
        duration: `${duration}ms`,
      });

      // Return generic error response
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract and validate session from request
 */
export async function getSessionFromRequest(request: NextRequest) {
  // In production, this would validate JWT tokens
  // For now, it's a placeholder for the session strategy
  const authHeader = request.headers.get('authorization');
  return authHeader ? { authenticated: true } : null;
}

/**
 * Validate request content type
 */
export function validateContentType(
  request: NextRequest,
  expectedType: string = 'application/json'
): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes(expectedType) ?? false;
}
