/**
 * API middleware utilities for request/response handling
 * Provides decorators and wrappers for common API patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { recordApiResponse, recordError } from './metrics';

/**
 * Wrap an API route handler with error handling, logging, and metrics recording
 * Automatically captures:
 * - Request/response times
 * - HTTP status codes
 * - Errors with context
 * - Performance metrics (X-Response-Time header)
 */
export function withErrorHandling(
  handler: (request?: NextRequest | undefined) => Promise<NextResponse>,
  routeName: string
) {
  return async (request?: NextRequest | undefined): Promise<NextResponse> => {
    const method = request?.method || 'UNKNOWN';
    const pathname = request?.nextUrl.pathname || '/unknown';
    const startTime = Date.now();

    try {
      logger.debug(`${method} ${pathname}`, { routeName });
      const response = await handler(request);
      const duration = Date.now() - startTime;

      logger.info(`${method} ${pathname} ${response.status}`, {
        routeName,
        method,
        pathname,
        status: response.status,
        duration: `${duration}ms`,
      });

      // Record performance metrics
      recordApiResponse(pathname, method, response.status, duration);

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

      // Record error metrics
      if (error instanceof Error) {
        recordError(error, { routeName, method, pathname });
      }

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
