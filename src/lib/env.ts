/**
 * Type-safe environment variables with validation
 * Ensures all required environment variables are present and correctly typed
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().min(1, 'NextAuth URL is required'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth secret must be at least 32 characters'),

  // Optional: Sentry (for error tracking)
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ENABLED: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),

  // Optional: Logfire (Pydantic logging)
  LOGFIRE_TOKEN: z.string().optional(),

  // Optional: DataDog
  DATADOG_API_KEY: z.string().optional(),

  // Optional: Google Tag Manager
  NEXT_PUBLIC_GTM_ID: z.string().optional(),

  // Production URL
  PROD_URL: z.string().optional(),
});

// Validate environment variables with fallback for production
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('Environment variable validation failed:', error);

  // For production, try to continue with partial validation
  if (process.env.NODE_ENV === 'production') {
    const requiredSchema = envSchema.pick({
      DATABASE_URL: true,
      NEXTAUTH_URL: true,
      NEXTAUTH_SECRET: true,
    });

    const requiredEnv = requiredSchema.parse(process.env);

    // Merge with optional values that might be missing
    env = {
      ...requiredEnv,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      SENTRY_ENABLED: process.env.SENTRY_ENABLED === 'true',
      LOGFIRE_TOKEN: process.env.LOGFIRE_TOKEN,
      DATADOG_API_KEY: process.env.DATADOG_API_KEY,
      NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
      PROD_URL: process.env.PROD_URL,
    };
  } else {
    throw error;
  }
}

// Type-safe environment variable access
export const envVars = {
  // Database
  databaseUrl: env.DATABASE_URL,

  // NextAuth
  nextAuthUrl: env.NEXTAUTH_URL,
  nextAuthSecret: env.NEXTAUTH_SECRET,

  // Sentry (optional)
  sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  sentryAuthToken: env.SENTRY_AUTH_TOKEN,
  sentryEnabled: env.SENTRY_ENABLED,

  // Logfire (optional)
  logfireToken: env.LOGFIRE_TOKEN,

  // DataDog (optional)
  datadogApiKey: env.DATADOG_API_KEY,

  // GTM (optional)
  gtmId: env.NEXT_PUBLIC_GTM_ID,

  // Production URL (optional)
  prodUrl: env.PROD_URL,

  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

// Export individual variables for convenience
export const {
  databaseUrl,
  nextAuthUrl,
  nextAuthSecret,
  sentryDsn,
  sentryAuthToken,
  sentryEnabled,
  logfireToken,
  datadogApiKey,
  gtmId,
  prodUrl,
  isDevelopment,
  isProduction,
  isTest,
} = envVars;

export default envVars;
