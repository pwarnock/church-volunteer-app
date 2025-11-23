/**
 * Standardized API response builder for consistent response formatting
 * Helps with API documentation and client integration
 */

import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Success response builder
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return NextResponse.json(response, { status });
}

/**
 * Error response builder
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown,
  code?: string
) {
  const response: ApiErrorResponse = {
    success: false,
    error,
  };
  if (details) {
    response.details = details;
  }
  if (code) {
    response.code = code;
  }
  return NextResponse.json(response, { status });
}

/**
 * Validation error response
 */
export function validationErrorResponse(details: unknown) {
  return errorResponse('Validation failed', 400, details, 'VALIDATION_ERROR');
}

/**
 * Unauthorized error response
 */
export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401, undefined, 'UNAUTHORIZED');
}

/**
 * Forbidden error response
 */
export function forbiddenResponse() {
  return errorResponse('Forbidden', 403, undefined, 'FORBIDDEN');
}

/**
 * Not found error response
 */
export function notFoundResponse(resource?: string) {
  const message = resource ? `${resource} not found` : 'Resource not found';
  return errorResponse(message, 404, undefined, 'NOT_FOUND');
}

/**
 * Rate limit error response
 */
export function rateLimitResponse(message?: string) {
  return errorResponse(
    message || 'Too many requests. Please try again later.',
    429,
    undefined,
    'RATE_LIMITED'
  );
}

/**
 * Internal error response
 */
export function internalErrorResponse(
  message: string = 'Internal server error'
) {
  return errorResponse(message, 500, undefined, 'INTERNAL_ERROR');
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T, message?: string) {
  return successResponse(data, message, 201);
}

/**
 * No content response (204)
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 });
}
