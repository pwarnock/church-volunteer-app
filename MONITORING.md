# Monitoring & Observability

This document describes the monitoring and observability infrastructure for Church Volunteer Connect.

## Overview

The application includes comprehensive monitoring for:

- **Error Tracking** - Sentry integration
- **Performance Metrics** - API response times, database queries, auth performance
- **Health Checks** - Database connectivity, application status
- **Rate Limiting** - Abuse detection and request throttling

All monitoring is **optional** and **feature-flagged** - services only activate when credentials are provided.

## Error Tracking with Sentry

**Status:** Optional (feature-flagged)

**Setup:**

1. Create account at https://sentry.io/
2. Create a new project for Next.js
3. Copy DSN from project settings
4. Add to `.env`:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@o123456.ingest.sentry.io/1234567"
   SENTRY_AUTH_TOKEN="sntrys_xxxxx"
   SENTRY_ENABLED="true"
   ```

**Files:**

- `sentry.config.ts` - Configuration with sample rates
- `src/lib/sentry.ts` - Wrapper functions for capturing errors/messages
- `src/lib/sentry-wrapper.ts` - API route decorators

**Features:**

- Error reporting with stack traces
- Transaction tracing (10% in production, 100% in dev)
- Performance monitoring
- User context tracking
- Breadcrumb tracking for debugging

**Usage in Code:**

```typescript
import { captureException, setUserContext } from '@/lib/sentry';

// After successful login
await setUserContext(userId, email, role);

// Capture errors
try {
  // operation
} catch (error) {
  await captureException(error, { endpoint: '/api/users' });
}
```

**Disabling:**
Set `SENTRY_ENABLED=false` to disable even if credentials are present.

## Performance Metrics

**Endpoint:** `GET /api/metrics` (leader-only access)

**Metrics Collected:**

- API response times per endpoint
- Database query performance per operation
- Authentication attempt timing
- Rate limit hits
- Error counts and types

**Metrics Structure:**

```json
{
  "success": true,
  "data": {
    "totalMetrics": 1234,
    "summary": {
      "api.post.signup": {
        "count": 156,
        "min": 45,
        "max": 3200,
        "avg": 280,
        "p95": 1200,
        "p99": 2800
      },
      "database.create.user": {
        "count": 156,
        "min": 12,
        "max": 450,
        "avg": 85,
        "p95": 200,
        "p99": 350
      }
    }
  }
}
```

**Severity Levels:**

- `info` - Normal operation
- `warning` - API >1s, Database >1s, Error rate >5%
- `critical` - API >3s, Database >5s, Error rate >10%

**Recording Metrics:**

```typescript
import {
  recordApiResponse,
  recordDatabaseQuery,
  recordAuthAttempt,
  recordRateLimitHit,
  recordError,
} from '@/lib/metrics';

// API response
recordApiResponse('signup', 'POST', 201, 250); // ms

// Database query
recordDatabaseQuery('create', 'User', 85, true);

// Auth attempt
recordAuthAttempt('signup', true, 280);

// Rate limit
recordRateLimitHit('signup', userId);

// Error
recordError(error, { endpoint: 'signup' });
```

## Health Checks

**Endpoint:** `GET /api/health`

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-11-22T12:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

**Status Codes:**

- `200` - Healthy
- `503` - Unhealthy (database down)

**Use Cases:**

- Kubernetes health checks
- Load balancer monitoring
- Deployment readiness checks
- Uptime monitoring services

## Logging

**Files:**

- `src/lib/logger.ts` - Structured logging

**Log Levels:**

- `debug` - Development only
- `info` - Important events
- `warn` - Warnings and unusual conditions
- `error` - Errors and failures

**Output:**

- Development: Pretty-printed to console
- Production: JSON format for log aggregation

**Integration Points:**

- Logs can be sent to external services (Logfire, DataDog, etc.)
- See `src/lib/logger.ts` for integration hooks

**Example:**

```typescript
import { logger } from '@/lib/logger';

logger.info('User registered', { userId, email, role });
logger.warn('Rate limit exceeded', { ip, endpoint });
logger.error('Database error', error, { operation: 'create' });
```

## Rate Limiting

**Features:**

- 5 signup attempts per 15 minutes per IP
- 10 application submissions per user per 60 minutes
- 20 opportunity creations per leader per 60 minutes

**Files:**

- `src/lib/rate-limit.ts` - In-memory rate limiter

**Configuration:**

```typescript
rateLimit(
  'signup:192.168.1.1', // Key
  5, // Limit
  15 * 60 * 1000 // Window (15 minutes)
);
```

**Production Note:**
For distributed deployments, replace in-memory store with Redis:

```typescript
// Example: Redis-based rate limiting
const rateLimiter = new Redis().limit('signup:ip', { max: 5, window: 900 });
```

## Monitoring Dashboard

For production, recommend setting up a dashboard that:

1. Pulls metrics from `/api/metrics`
2. Tracks Sentry error trends
3. Monitors health endpoint
4. Alerts on critical metrics

**Suggested Tools:**

- Grafana (for metrics visualization)
- Sentry Dashboard (included)
- Vercel Analytics (free, built-in)
- Datadog (enterprise monitoring)
- CloudWatch (AWS-based)

## Setting Up Vercel Analytics

1. In Vercel dashboard, enable Web Analytics
2. See Core Web Vitals for free
3. No configuration needed

## Database Query Monitoring

Prisma 6 includes built-in query logging. Enable in development:

```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});
```

## Alerts & Notifications

**To Add Alerts:**

1. **Sentry:** Configure email/Slack in Sentry dashboard
2. **Custom:** Use metrics endpoint to trigger alerts
3. **Vercel:** Set up deployment notifications

Example alert conditions:

- Error rate >10%
- API response >3s
- Database query >5s
- Signup failures >20%
- Health check fails

## Performance Targets

**Recommended SLOs:**

- API response time: p95 <1s, p99 <2s
- Database query: p95 <200ms, p99 <500ms
- Error rate: <1%
- Availability: 99.9%

## Next Steps

1. **Enable Sentry:** Create account, add credentials to `.env`
2. **Setup Dashboard:** Configure Grafana or Datadog
3. **Create Alerts:** Set up notifications for critical metrics
4. **Monitor Core Web Vitals:** Use Vercel Analytics
5. **Log Aggregation:** Integrate with external logging service

## Debugging

### Check Metrics

```bash
curl -H "Authorization: Bearer token" https://yourapp.com/api/metrics
```

### Check Health

```bash
curl https://yourapp.com/api/health
```

### View Logs

```bash
# Development
bun run dev  # Logs print to console

# Production
# Check Sentry dashboard or external log service
```

### Monitor Database

```bash
bunx prisma studio  # Visual database browser
```

## Troubleshooting

**Sentry not receiving errors:**

- Verify `NEXT_PUBLIC_SENTRY_DSN` is set
- Verify `SENTRY_AUTH_TOKEN` is set
- Check `SENTRY_ENABLED` is not `false`
- Check Sentry project settings

**Metrics not recording:**

- Verify `recordMetric()` is called in API routes
- Check `/api/metrics` endpoint returns data
- Verify user has `MINISTRY_LEADER` role

**High latency:**

- Check database connection pool
- Review slow query logs
- Check Sentry for errors

## References

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Monitoring](https://nextjs.org/docs/pages/building-your-application/optimizing/monitoring)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Web Vitals](https://web.dev/vitals/)
