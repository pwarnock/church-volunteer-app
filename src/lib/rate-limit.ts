/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Rate limit a request by key (e.g., IP or email)
 * @param key Unique identifier (IP address, email, etc.)
 * @param limit Max requests allowed
 * @param windowMs Time window in milliseconds
 * @returns true if request is allowed, false if limit exceeded
 */
export function rateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes default
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count < limit) {
    entry.count++;
    return true;
  }

  return false;
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(key: string) {
  const entry = store.get(key);
  return {
    count: entry?.count ?? 0,
    resetTime: entry?.resetTime ?? 0,
    remaining: entry ? Math.max(0, 5 - entry.count) : 5,
  };
}

/**
 * Clear all rate limit entries (for testing)
 */
export function clearRateLimits() {
  store.clear();
}

/**
 * Cleanup old entries (run periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

// Cleanup every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);
