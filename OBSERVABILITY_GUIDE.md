# Observability & Monitoring Guide

Complete implementation of logging, performance monitoring, and error tracking for Church Volunteer Connect.

## Overview

The application includes production-ready observability infrastructure with:

- **Structured Logging** - Development pretty-printing, production JSON output
- **Metrics Collection** - API response times, database queries, auth performance, error rates
- **Error Tracking** - Sentry integration for error aggregation and alerting
- **External Observability** - Logfire (Pydantic) and DataDog support
- **API Middleware** - Automatic metrics recording on all routes
- **Database Monitoring** - Slow query detection and logging

All services are **optional** and **feature-flagged** - enable only what you need.

## 1. Structured Logging

### Implementation

**File:** `src/lib/logger.ts`

Centralized logging with automatic environment-based formatting:

```typescript
import { logger } from '@/lib/logger';

// Development: Pretty-printed
logger.info('User registered', { userId: user.id, email: user.email });
// Output:
// [2024-11-22T12:00:00Z] INFO: User registered {
//   context: { userId: 'abc123', email: 'user@example.com' },
//   error: undefined
// }

// Production: JSON (parseable by log aggregation services)
logger.error('Database error', error, { operation: 'create' });
// Output:
// {"timestamp":"2024-11-22T12:00:00Z","level":"ERROR","message":"Database error","context":{"operation":"create"},"error":{"name":"PrismaError","message":"..."}}
```

### Log Levels

- `debug` - Development only, detailed information
- `info` - Important events (user actions, successful operations)
- `warn` - Warnings and unusual conditions
- `error` - Errors and failures

### External Service Integration

Automatically sends logs to configured services:

#### Logfire (Pydantic)

```bash
# .env
LOGFIRE_TOKEN="your-token-from-logfire.pydantic.dev"
```

Sends structured logs to Logfire for centralized logging and analysis.

#### DataDog

```bash
# .env
DATADOG_API_KEY="your-api-key-from-app.datadoghq.com"
```

Sends logs to DataDog for comprehensive monitoring and alerting.

### Usage Examples

```typescript
// Info - business events
logger.info('Application submitted', {
  userId: session.user.id,
  opportunityId: opportunityId,
});

// Warn - unexpected but recoverable
logger.warn('Duplicate application attempt', {
  userId: session.user.id,
  opportunityId,
});

// Error - critical failures
logger.error('Signup error', error, {
  email: user.email,
  endpoint: 'signup',
});
```

## 2. Performance Metrics

### Implementation

**File:** `src/lib/metrics.ts`

Collects performance data on:

- API response times per endpoint
- Database query performance by operation and model
- Authentication attempt timing
- Rate limit hits
- Error counts and types

### Metrics Endpoint

**URL:** `GET /api/metrics` (ministry leader only)

Returns aggregated metrics with statistics:

```json
{
  "success": true,
  "data": {
    "totalMetrics": 1234,
    "recordedAt": "2024-11-22T12:00:00Z",
    "summary": {
      "api.post./api/applications": {
        "count": 42,
        "min": 45,
        "max": 3200,
        "avg": 280,
        "p95": 1200,
        "p99": 2800
      },
      "database.create.application": {
        "count": 42,
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

### Severity Levels

Automatically determines severity based on thresholds:

| Metric         | Warning | Critical |
| -------------- | ------- | -------- |
| API Response   | >1s     | >3s      |
| Database Query | >1s     | >5s      |
| Error Rate     | >5%     | >10%     |

Critical metrics are:

- Logged with `console.error`
- Sent to Sentry (if enabled)
- Can trigger alerts

### Recording Metrics

Use metric recording functions in API routes:

```typescript
import {
  recordApiResponse,
  recordDatabaseQuery,
  recordAuthAttempt,
  recordRateLimitHit,
  recordError,
} from '@/lib/metrics';

// API response - automatically recorded by withErrorHandling()
recordApiResponse(pathname, method, status, durationMs);

// Database query - use with withDatabaseMetrics()
recordDatabaseQuery('create', 'User', 85, true);

// Auth attempt
recordAuthAttempt('signup', true, 280);

// Rate limit hit
recordRateLimitHit('/api/applications', userId);

// Error
recordError(error, { endpoint: 'signup', userId });
```

## 3. API Middleware & Automatic Metrics

### Implementation

**File:** `src/lib/api-middleware.ts`

Wraps all API route handlers with:

- Error handling and logging
- Automatic metrics recording
- Performance headers (X-Response-Time)
- Consistent error responses

### Usage

```typescript
import { withErrorHandling } from '@/lib/api-middleware';

const handlePost = async (request: NextRequest) => {
  // Your route logic
  return createdResponse(data);
};

export const POST = withErrorHandling(handlePost, 'POST /api/applications');
```

### What Gets Tracked Automatically

- Request method and path
- Response status code
- Response duration
- Any errors thrown
- X-Response-Time header added to response

### Example Log Output

```
[2024-11-22T12:00:00Z] INFO: POST /api/applications 201 {
  context: {
    routeName: 'POST /api/applications',
    method: 'POST',
    pathname: '/api/applications',
    status: 201,
    duration: '245ms'
  }
}
```

### Wired Routes

Currently instrumented with metrics:

- `POST /api/auth/signup`
- `GET /api/opportunities`
- `POST /api/opportunities`
- `GET /api/applications`
- `POST /api/applications`
- `GET /api/volunteer/profile`
- `POST /api/volunteer/profile`

## 4. Error Tracking with Sentry

### Setup

1. Create account at https://sentry.io/
2. Create new Next.js project
3. Copy DSN from project settings

### Configuration

**File:** `sentry.config.ts`

Add environment variables:

```bash
NEXT_PUBLIC_SENTRY_DSN="https://xxxxx@o123456.ingest.sentry.io/1234567"
SENTRY_AUTH_TOKEN="sntrys_xxxxx"
SENTRY_ENABLED="true"  # Optional, default true if credentials set
```

### Features

- Error reporting with stack traces
- Transaction tracing (10% sample rate in production, 100% in dev)
- User context tracking
- Breadcrumb tracking
- Source map support

### Usage

```typescript
import { captureException, setUserContext } from '@/lib/sentry';

// Track user context (after login)
await setUserContext(userId, email, role);

// Capture exceptions (optional, auto-captured by middleware)
try {
  // operation
} catch (error) {
  await captureException(error, { endpoint: '/api/users' });
}

// Clear context (on logout)
await clearUserContext();
```

### Disabling Sentry

Set `SENTRY_ENABLED=false` in environment to disable even with credentials.

## 5. Database Query Monitoring

### Implementation

**File:** `src/lib/db-metrics.ts`

Utility to wrap database operations and measure performance:

```typescript
import { withDatabaseMetrics } from '@/lib/db-metrics';

// Wrap individual queries
const user = await withDatabaseMetrics('findUnique', 'User', () =>
  prisma.user.findUnique({ where: { id } })
);

// Or for bulk operations
const users = await withDatabaseMetrics('findMany', 'User', () =>
  prisma.user.findMany()
);
```

### What Gets Tracked

- Operation type (create, update, delete, findUnique, findMany, etc.)
- Model name (User, Opportunity, Application, etc.)
- Duration in milliseconds
- Success/failure status

### Slow Query Detection

Logs warnings for slow queries:

- **Development:** >1 second
- **Production:** >5 seconds

Example:

```
[2024-11-22T12:00:00Z] WARN: Slow database query {
  context: {
    model: 'Application',
    operation: 'findMany',
    duration: '1250ms',
    threshold: '1000ms'
  }
}
```

### Prisma Logging

Development mode includes Prisma query logging:

```bash
# .env
NODE_ENV=development  # Automatically enables query logging
```

## 6. Configuration

### Environment Variables

```bash
# Logging & Observability
NODE_ENV=production              # Controls formatting and verbosity

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=""        # DSN from sentry.io project
SENTRY_AUTH_TOKEN=""             # Auth token from sentry.io
SENTRY_ENABLED="true"            # Set to false to disable

# Logfire (Structured Logging)
LOGFIRE_TOKEN=""                 # Token from logfire.pydantic.dev

# DataDog (Comprehensive Monitoring)
DATADOG_API_KEY=""               # API key from app.datadoghq.com
```

### Production Setup Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable Sentry: Add `NEXT_PUBLIC_SENTRY_DSN` and `SENTRY_AUTH_TOKEN`
- [ ] Enable Logfire: Add `LOGFIRE_TOKEN` (optional)
- [ ] Enable DataDog: Add `DATADOG_API_KEY` (optional)
- [ ] Pull production env: `vercel env pull .env.production.local`
- [ ] Test metrics endpoint: `GET /api/metrics` (requires leader role)
- [ ] Test health check: `GET /api/health`

## 7. Monitoring Dashboard Setup

### Option 1: Grafana (Free)

```
1. Download/install Grafana
2. Add data sources (Prometheus, InfluxDB, etc.)
3. Create dashboard that pulls from /api/metrics
4. Set alerts for thresholds
```

### Option 2: Sentry Dashboard

Built-in with Sentry:

- Error trends and spike detection
- Release tracking
- User impact analysis
- Performance monitoring

### Option 3: Vercel Analytics

Free with Vercel deployment:

1. Enable in Vercel project settings
2. View Core Web Vitals
3. Monitor performance automatically

### Option 4: DataDog

Enterprise monitoring:

- Logs, metrics, and traces in one platform
- Built-in alerting and dashboards
- APM and infrastructure monitoring

## 8. Performance Targets

### Recommended SLOs (Service Level Objectives)

| Metric            | p95    | p99    |
| ----------------- | ------ | ------ |
| API Response Time | <1s    | <2s    |
| Database Query    | <200ms | <500ms |
| Error Rate        | <1%    | N/A    |
| Availability      | 99.9%  | N/A    |

## 9. Troubleshooting

### Sentry Not Receiving Errors

```bash
# Check configuration
echo $NEXT_PUBLIC_SENTRY_DSN   # Should not be empty
echo $SENTRY_AUTH_TOKEN        # Should not be empty
echo $SENTRY_ENABLED           # Should be 'true' or unset
```

### Metrics Not Recording

```bash
# Check endpoint with leader auth
curl -H "Cookie: sessionid=..." \
  https://yourapp.com/api/metrics

# Should return metrics summary, not 401
```

### Missing Database Metrics

Use `withDatabaseMetrics()` wrapper on Prisma queries that need tracking:

```typescript
// Before
const user = await prisma.user.findUnique({ where: { id } });

// After
const user = await withDatabaseMetrics('findUnique', 'User', () =>
  prisma.user.findUnique({ where: { id } })
);
```

### High Latency

1. Check `/api/metrics` p95/p99 values
2. Look for slow queries in logs
3. Review Sentry for errors
4. Check database connection pool
5. Verify rate limiting isn't triggering

## 10. Integration Examples

### Log an Important Event

```typescript
import { logger } from '@/lib/logger';

async function publishOpportunity(opportunity) {
  logger.info('Opportunity published', {
    opportunityId: opportunity.id,
    title: opportunity.title,
    leaderId: opportunity.leaderId,
  });
}
```

### Capture and Report an Error

```typescript
import { captureException } from '@/lib/sentry';

try {
  await processApplication(application);
} catch (error) {
  // Automatically logged by middleware
  // Optionally send to Sentry with context
  await captureException(error, {
    applicationId: application.id,
    userId: session.user.id,
  });
}
```

### Monitor a Database Operation

```typescript
import { withDatabaseMetrics } from '@/lib/db-metrics';

const applications = await withDatabaseMetrics('findMany', 'Application', () =>
  prisma.application.findMany({
    where: { opportunity: { leaderId: session.user.id } },
    include: { opportunity: true, volunteer: true },
  })
);
```

### Check Health Status

```bash
# Simple health check
curl https://yourapp.com/api/health

# Response
{
  "status": "ok",
  "timestamp": "2024-11-22T12:00:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

## 11. Next Steps

### High Priority

1. **Enable Sentry**: Create account, add environment variables
2. **Setup Dashboard**: Configure Grafana or use Sentry dashboard
3. **Create Alerts**: Set notifications for critical metrics
4. **Monitor Core Web Vitals**: Use Vercel Analytics

### Medium Priority

1. **Add Logfire**: For centralized structured logging
2. **Track Database Metrics**: Wrap slow/critical queries with `withDatabaseMetrics()`
3. **Setup Log Rotation**: For production logging volume
4. **Create Custom Metrics**: For business-specific events

### Low Priority

1. **APM Integration**: Application Performance Monitoring
2. **Custom Dashboards**: Grafana or DataDog
3. **Advanced Alerting**: Slack/email notifications
4. **Log Analysis**: Query logs for insights

## 12. References

- [Sentry Documentation](https://docs.sentry.io/product/getting-started/)
- [Logfire Documentation](https://logfire.pydantic.dev/docs/)
- [DataDog Documentation](https://docs.datadoghq.com/)
- [Next.js Monitoring](https://nextjs.org/docs/app/building-your-application/optimizing/monitoring)
- [Web Vitals](https://web.dev/vitals/)
