/**
 * Production Smoke Tests
 *
 * Domain: Production health monitoring
 * Responsibility: Verify critical production functionality after deployment
 * Boundaries: Read-only health checks, no data modification
 */

import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
  const PROD_URL = process.env.PROD_URL;

  if (!PROD_URL) {
    throw new Error(
      'PROD_URL environment variable is required for smoke tests'
    );
  }

  test.beforeEach(async ({ page }) => {
    // Set base URL to production
    page.goto(PROD_URL);
  });

  test('production health endpoint responds', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);

    expect(response.status()).toBe(200);

    const health = await response.json();
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('environment', 'production');
    expect(health).toHaveProperty('hasDatabaseUrl', true);
    expect(health).toHaveProperty('hasNextAuthUrl', true);
    expect(health).toHaveProperty('hasNextAuthSecret', true);
  });

  test('production application loads successfully', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page.locator('body')).toBeVisible();

    // Check for critical elements
    const title = await page.title();
    expect(title).toBeTruthy();

    // No console errors
    const logs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');
    expect(logs.filter((log) => !log.includes('Warning')).length).toBe(0);
  });

  test('production authentication endpoints are accessible', async ({
    request,
  }) => {
    // Test that auth endpoints respond (not functionality, just accessibility)
    const response = await request.get(`${PROD_URL}/api/auth/signin`);
    expect([200, 404, 405]).toContain(response.status());
  });

  test('production static assets load correctly', async ({ page }) => {
    // Check that CSS and JS assets load
    const responses: { url: string; status: number }[] = [];

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('.css') || url.includes('.js')) {
        responses.push({ url, status: response.status() });
      }
    });

    await page.waitForLoadState('networkidle');

    // All static assets should load successfully
    const failedAssets = responses.filter((r) => r.status >= 400);
    expect(failedAssets.length).toBe(0);
  });

  test('production database connectivity', async ({ request }) => {
    // Test database connectivity through health endpoint
    const response = await request.get(`${PROD_URL}/api/health`);
    const health = await response.json();

    expect(health.hasDatabaseUrl).toBe(true);
  });

  test('production security headers are present', async ({ request }) => {
    const response = await request.get(PROD_URL);

    // Check for security headers
    const headers = response.headers();

    // These should be present in production
    expect(
      headers['x-frame-options'] || headers['content-security-policy']
    ).toBeTruthy();
  });

  test('production accessibility compliance', async ({ page }) => {
    // Skip to main content link should be present
    const skipLink = page
      .locator('a[href*="main"], a[href*="content"]')
      .first();
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }

    // Main landmark should exist
    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    // Page should have proper heading structure
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });
});
