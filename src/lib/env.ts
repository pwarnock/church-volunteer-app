/**
 * Type-safe environment variables with validation
 * Ensures all required environment variables are present and correctly typed
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url('Database URL is required and must be a valid URL'),

  // NextAuth
  NEXTAUTH_URL: z
    .string()
    .url('NextAuth URL is required and must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth secret must be at least 32 characters'),

  // Optional: Sentry (for error tracking)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ENABLED: z.enum(['true', 'false']).optional(),

  // Optional: Logfire (Pydantic logging)
  LOGFIRE_TOKEN: z.string().optional(),

  // Optional: DataDog
  DATADOG_API_KEY: z.string().optional(),

  // Optional: Google Tag Manager
  NEXT_PUBLIC_GTM_ID: z.string().optional(),

  // Production URL
  PROD_URL: z.string().url().optional(),
});

// Validate environment variables
const env = envSchema.parse(process.env);

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
  sentryEnabled: env.SENTRY_ENABLED === 'true',

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
