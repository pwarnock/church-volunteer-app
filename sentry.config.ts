/**
 * Sentry configuration (optional, feature-flagged)
 *
 * Only initialize if NEXT_PUBLIC_SENTRY_DSN is set in environment
 * This configuration is loaded by Next.js wrapper
 */

import * as Sentry from '@sentry/nextjs';

// Only initialize if DSN is provided
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const authToken = process.env.SENTRY_AUTH_TOKEN;
const enabled = dsn && authToken && process.env.SENTRY_ENABLED !== 'false';

if (enabled) {
  Sentry.init({
    dsn,
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Set sample rate for error events
    sampleRate: process.env.NODE_ENV === 'production' ? 0.8 : 1.0,

    // Capture breadcrumbs
    maxBreadcrumbs: 50,

    // Environment
    environment: process.env.NODE_ENV || 'development',

    // Release version
    release: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',

    // Ignore certain errors
    ignoreErrors: [
      // Network errors that are expected in some cases
      'NetworkError',
      'timeout',
      // Browser extensions
      'chrome-extension://',
      'moz-extension://',
    ],
  });
}

export { enabled as sentryEnabled };
