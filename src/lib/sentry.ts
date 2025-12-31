/**
 * Sentry error tracking integration (optional, feature-flagged)
 *
 * Enabled when SENTRY_AUTH_TOKEN and NEXT_PUBLIC_SENTRY_DSN are set
 * Set SENTRY_ENABLED=false to explicitly disable even if credentials are present
 */

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  // Explicit disable flag takes precedence
  if (process.env.SENTRY_ENABLED === 'false') {
    return false;
  }

  // Require both DSN and auth token for production use
  const hasDsn = !!process.env.NEXT_PUBLIC_SENTRY_DSN;
  const hasAuthToken = !!process.env.SENTRY_AUTH_TOKEN;

  return hasDsn && hasAuthToken;
}

/**
 * Capture exception with Sentry (if enabled)
 * Falls back to logger if Sentry is disabled
 */
export async function captureException(
  error: Error,
  context?: Record<string, unknown>
) {
  if (!isSentryEnabled()) {
    // Fallback to standard logging
    console.error('Error captured:', error.message, context);
    return;
  }

  try {
    // Dynamic import to avoid bundling Sentry if disabled
    const { captureException: sentryCaptureException } =
      await import('@sentry/nextjs');
    sentryCaptureException(error, { contexts: { custom: context } });
  } catch (e) {
    console.error('Failed to send to Sentry:', e);
  }
}

/**
 * Capture message with Sentry (if enabled)
 */
export async function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
) {
  if (!isSentryEnabled()) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
    return;
  }

  try {
    const { captureMessage: sentryCaptureMessage, setContext } =
      await import('@sentry/nextjs');
    sentryCaptureMessage(message, level);
    if (context) {
      setContext('custom', context);
    }
  } catch (e) {
    console.error('Failed to send message to Sentry:', e);
  }
}

/**
 * Set user context for error tracking
 */
export async function setUserContext(
  userId: string,
  email?: string,
  role?: string
) {
  if (!isSentryEnabled()) {
    return;
  }

  try {
    const { setUser } = await import('@sentry/nextjs');
    setUser({
      id: userId,
      email,
      custom_role: role,
    });
  } catch (e) {
    console.error('Failed to set user context in Sentry:', e);
  }
}

/**
 * Clear user context (on logout)
 */
export async function clearUserContext() {
  if (!isSentryEnabled()) {
    return;
  }

  try {
    const { setUser } = await import('@sentry/nextjs');
    setUser(null);
  } catch (e) {
    console.error('Failed to clear user context in Sentry:', e);
  }
}
