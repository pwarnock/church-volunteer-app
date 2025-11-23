import { defineConfig, devices } from '@playwright/test';

/**
 * E2E Test Configuration
 *
 * Domain: End-to-end testing
 * Responsibility: Configure Playwright for browser automation tests
 * Boundaries: e2e/ directory only, excludes unit tests
 */
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
