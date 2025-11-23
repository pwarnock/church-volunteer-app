/**
 * Enhanced API middleware utilities for consistent error handling
 * Provides standardized wrappers for all API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { recordApiResponse, recordError } from './metrics';

/**
 * Standardized API response wrapper with error handling, logging, and metrics
 */
export function withApiHandler(
  handler: (request: NextRequest) => Promise<NextResponse>,
  routeName: string
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const method = request?.method || 'GET';
    const pathname = request?.nextUrl.pathname || '/unknown';
    const startTime = Date.now();

    try {
      logger.debug(`${method} ${pathname}`, { routeName });

      const response = await handler(request);
      const duration = Date.now() - startTime;

      // Add performance header
      response.headers.set('X-Response-Time', `${duration}ms`);

      // Record metrics
      recordApiResponse(routeName, response.status, duration);

      logger.debug(`${method} ${pathname} completed`, {
        routeName,
        status: response.status,
        duration,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error with context
      logger.error(`${method} ${pathname} failed`, error, {
        routeName,
        method,
        duration,
        userAgent: request?.headers.get('user-agent'),
        ip: request?.headers.get('x-forwarded-for') || 'unknown',
      });

      // Record error metrics
      recordError(routeName, error);

      // Return standardized error response
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          details:
            process.env.NODE_ENV === 'development' ? String(error) : undefined,
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString(),
        },
        {
          status: 500,
          headers: {
            'X-Response-Time': `${duration}ms`,
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}

/**
 * Validation wrapper for API routes
 */
export function withValidation(
  handler: (request: NextRequest, data: any) => Promise<NextResponse>,
  schema: {
    safeParse: (data: unknown) => { success: boolean; data?: any; error?: any };
  }
) {
  return withApiHandler(async (request: NextRequest) => {
    if (!request) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request is required',
          code: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    try {
      const body = await request.json();
      const validationResult = schema.safeParse(body);

      if (!validationResult.success) {
        logger.warn('Validation failed', {
          errors: validationResult.error,
          body,
        });

        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validationResult.error,
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        );
      }

      return await handler(request, validationResult.data);
    } catch (error) {
      logger.error('Request parsing failed', error);

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          code: 'PARSE_ERROR',
        },
        { status: 400 }
      );
    }
  }, 'validation-route');
}

/**
 * Authentication wrapper for protected routes
 */
export function withAuth(
  handler: (request: NextRequest, session: any) => Promise<NextResponse>
) {
  return withApiHandler(async (request: NextRequest) => {
    if (!request) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request is required',
          code: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    // Get session (implementation depends on your auth setup)
    const session = null; // Would implement actual session check here

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    return await handler(request, session);
  }, 'protected-route');
}

/**
 * Success response helper
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Error response helper
 */
export function createErrorResponse(
  error: string,
  code: string = 'UNKNOWN_ERROR',
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
