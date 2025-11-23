# Production Best Practices

This document outlines the production-ready features and best practices implemented in the Church Volunteer Connect application.

## Overview

The application follows Next.js 16 and React 19 best practices with a focus on security, reliability, and maintainability.

## Core Infrastructure

### 1. Error Handling & Boundaries

**Files:**

- `src/app/error.tsx` - Global error boundary for unhandled errors
- `src/app/not-found.tsx` - Custom 404 page

**Features:**

- Graceful error pages with user-friendly messaging
- Error ID tracking (digest) for debugging
- Fallback UI for server errors

### 2. Health Checks

**Endpoint:** `GET /api/health`

**Features:**

- Database connectivity verification
- Application status monitoring
- Deployment health validation

**Usage:** Health check endpoints are essential for container orchestration platforms (Kubernetes, Vercel, AWS ECS)

### 3. Middleware & Security Headers

**File:** `src/middleware.ts`

**Headers Implemented:**

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Blocks clickjacking attacks
- `X-XSS-Protection: 1; mode=block` - XSS attack protection
- `Strict-Transport-Security: max-age=31536000` - Forces HTTPS
- `Content-Security-Policy` - Restricts resource loading
- `Access-Control-*` - CORS configuration

## Request Validation

### 4. Zod Schemas

**File:** `src/lib/validators.ts`

**Schemas:**

- `signupSchema` - User registration validation
- `signinSchema` - Login credential validation
- `opportunitySchema` - Volunteer opportunity creation
- `applicationSchema` - Application submissions
- `profileSchema` - Volunteer profile updates

**Features:**

- Type-safe validation with runtime checks
- Automatic TypeScript type inference
- Detailed error messages

**Usage Example:**

```typescript
const result = signupSchema.safeParse(body);
if (!result.success) {
  return validationErrorResponse(result.error.flatten());
}
```

## Rate Limiting

### 5. Request Rate Limiting

**File:** `src/lib/rate-limit.ts`

**Protected Endpoints:**

- `POST /api/auth/signup` - 5 attempts per 15 minutes per IP
- `POST /api/applications` - 10 submissions per user per 60 minutes
- `POST /api/opportunities` - 20 creations per leader per 60 minutes

**Features:**

- In-memory store with automatic cleanup
- Configurable limits and time windows
- Returns 429 (Too Many Requests) status code

**Production Note:** For distributed deployments, replace with Redis-based rate limiting.

## Logging & Monitoring

### 6. Structured Logging

**File:** `src/lib/logger.ts`

**Log Levels:**

- `DEBUG` - Development only
- `INFO` - Important events
- `WARN` - Warnings and unusual conditions
- `ERROR` - Errors and failures

**Features:**

- Structured logging with contextual information
- Automatic error formatting with stack traces
- Development pretty-printing, production JSON output
- Ready for integration with external observability platforms

**Supported External Services:**

- Pydantic Logfire
- Sentry
- DataDog
- CloudWatch
- Custom endpoints

**Example Usage:**

```typescript
logger.error('Signup error', error, { email: user.email });
logger.info('User registered', { userId: user.id, role: user.role });
logger.warn('Rate limit exceeded', { ip: '192.168.1.1' });
```

**Production Integration:**

To integrate with Logfire or similar service, uncomment the integration code in `src/lib/logger.ts` and add the service token to `.env`.

### 7. API Response Standardization

**File:** `src/lib/api-response.ts`

**Response Format:**

```typescript
// Success
{ success: true, data: {...}, message?: "..." }

// Error
{ success: false, error: "...", details?: {...}, code?: "ERROR_CODE" }
```

**Helper Functions:**

- `successResponse()` - Standard 200 response
- `createdResponse()` - 201 response for resource creation
- `errorResponse()` - Generic error response
- `validationErrorResponse()` - Validation failures
- `unauthorizedResponse()` - 401 unauthorized
- `forbiddenResponse()` - 403 forbidden
- `notFoundResponse()` - 404 not found
- `rateLimitResponse()` - 429 rate limited
- `internalErrorResponse()` - 500 server error

## API Middleware

### 8. Request/Response Interceptor

**File:** `src/lib/api-middleware.ts`

**Features:**

- `withErrorHandling()` - Wraps route handlers with error handling
- Automatic request/response logging
- Performance metrics (X-Response-Time header)
- Consistent error responses

**Usage:**

```typescript
export const POST = withErrorHandling(async (request) => {
  // Your handler code
}, 'route-name');
```

## API Documentation

### 9. OpenAPI 3.0 Schema

**Files:**

- `src/lib/api-docs.ts` - OpenAPI schema definition
- `src/app/api/docs/route.ts` - Serves the schema

**Endpoint:** `GET /api/docs`

**Documented:**

- All public endpoints
- Request/response schemas
- Authentication requirements
- Status codes and error responses
- Security schemes (JWT)

**Integration:**
Can be used with:

- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [ReDoc](https://redoc.ly/)
- [Postman](https://www.postman.com/)

## Implementation Examples

### Example: Protected Route with Validation

```typescript
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { opportunitySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { validationErrorResponse, createdResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return unauthorizedResponse();
  }

  // Rate limiting
  if (!rateLimit(`opportunities:${session.user.id}`, 20, 60 * 60 * 1000)) {
    return rateLimitResponse();
  }

  // Validation
  const body = await request.json();
  const result = opportunitySchema.safeParse({
    ...body,
    leaderId: session.user.id,
  });
  if (!result.success) {
    return validationErrorResponse(result.error.flatten());
  }

  // Process request
  const data = result.data;
  // ... create resource ...

  return createdResponse(resource, 'Opportunity created successfully');
}
```

## Database Operations

### 10. Prisma Setup

**Configuration:**

- Production: PostgreSQL via Vercel Postgres
- Development: SQLite for local development
- Type-safe queries with generated client

**Best Practices:**

- Use `bunx prisma db push` after schema changes
- Use `bunx prisma generate` to generate client
- Handle transactions for multi-step operations

## Environment Configuration

### 11. Environment Variables

**File:** `.env.example`

**Required Variables:**

- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Session encryption key (min 32 chars)

**Production:**

- Use `vercel env pull` to sync production variables
- Never commit `.env.local` or secrets

## Pre-commit Hooks

### 12. Automated Code Quality

**Tools:**

- ESLint - Code style enforcement
- Prettier - Code formatting
- TypeScript - Type checking

**Runs automatically before each commit via husky/lint-staged**

## Testing Infrastructure

### Unit Tests

- Framework: Vitest
- Command: `bun test`
- Coverage: 86+ tests passing

### BDD Tests

- Framework: Cucumber
- Command: `bun test:bdd`
- Scenarios: 16+ passing

### E2E Tests

- Framework: Playwright
- Commands:
  - `bun test:e2e` - Run tests
  - `bun test:e2e:ui` - UI mode
  - `bun test:e2e:debug` - Debug mode

### Accessibility Tests

- Framework: Axe + Playwright
- Coverage: WCAG 2.1 AA compliance

## Deployment

### Vercel Configuration

**Production URL:** https://church-volunteer-pdtdizlyr-pete-warnocks-projects.vercel.app

**Build Command:**

```bash
prisma generate && next build
```

**Deployment Protection:** Enabled

**Database:** PostgreSQL (Vercel Postgres)

## Monitoring & Observability

### Integration Points

**Logging System:**

- Structured JSON output in production
- Pretty-printed output in development
- Ready for integration with:
  - Sentry (error tracking)
  - LogRocket (session replay)
  - Datadog (metrics)
  - CloudWatch (AWS)

**Performance Metrics:**

- Response time headers (X-Response-Time)
- Request/response logging
- Error tracking with stack traces

## Security Checklist

- [x] HTTPS enforced (HSTS)
- [x] XSS protection enabled
- [x] Clickjacking prevention (X-Frame-Options)
- [x] CSRF protection via NextAuth
- [x] Rate limiting on sensitive endpoints
- [x] Input validation with Zod
- [x] Password hashing with bcrypt
- [x] JWT-based session strategy
- [x] Secure headers via middleware
- [x] Health check endpoint for load balancers

## Performance Considerations

- Rate limiting prevents abuse
- Input validation prevents malformed requests
- Error boundaries prevent cascading failures
- Structured logging enables debugging without verbose logging
- Health checks allow for zero-downtime deployments

## Next Steps

### High Priority

- [ ] Add pagination to list endpoints (opportunities, applications)
- [ ] Implement external logging service integration (Sentry, etc.)
- [ ] Add performance monitoring (APM)
- [ ] Setup email notifications for applications

### Medium Priority

- [ ] Add API versioning (v1, v2, etc.)
- [ ] Implement webhook system for third-party integrations
- [ ] Add batch operations support
- [ ] Implement full-text search

### Low Priority

- [ ] GraphQL support
- [ ] WebSocket support for real-time updates
- [ ] Advanced analytics dashboard
- [ ] API key-based authentication

## References

- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [Zod Validation](https://zod.dev/)
- [NextAuth Documentation](https://next-auth.js.org/)
- [Vercel Deployment](https://vercel.com/docs)
- [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3)
