import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    
    // Apply different rate limits for different endpoints
    if (request.nextUrl.pathname.includes('/auth/')) {
      // Stricter rate limiting for auth endpoints
      rateLimit(`auth:${clientIP}`, 5, 15 * 60 * 1000); // 15 minutes
    } else if (request.nextUrl.pathname.includes('/applications/')) {
      // Rate limit for applications
      rateLimit(`applications:${clientIP}`, 10, 60 * 60 * 1000); // 1 hour
    } else if (request.nextUrl.pathname.includes('/opportunities/')) {
      // Rate limit for opportunity creation
      rateLimit(`opportunities:${clientIP}`, 20, 60 * 60 * 1000); // 1 hour
    }
  }

  // Remove server information headers
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files, API auth routes, and Next.js internals
    '/((?!_next|api/auth|static|favicon.ico).*)',
    '/api/:path*',
  ],
};