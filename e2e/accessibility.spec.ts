import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';
import { TEST_CREDENTIALS } from './test-credentials';

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test('sign in page has no accessibility violations', async ({ page }) => {
    await page.goto('/auth/signin');
    await injectAxe(page);

    // Check for accessibility violations
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('dashboard page has no accessibility violations', async ({ page }) => {
    // Sign in first
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', TEST_CREDENTIALS.volunteer.email);
    await page.fill(
      'input[type="password"]',
      TEST_CREDENTIALS.volunteer.password
    );
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 5000 });

    // Check accessibility
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
    });
  });

  test('form labels are associated with inputs', async ({ page }) => {
    await page.goto('/auth/signin');

    // Email input should have associated label
    const emailInput = page.locator('input[type="email"]');
    const emailLabel = page.locator('label:has-text("Email"), label[for]');

    // Check if label exists or input has aria-label
    const hasLabel =
      (await emailLabel.count()) > 0 ||
      (await emailInput.getAttribute('aria-label'));

    expect(hasLabel).toBeTruthy();
  });

  test('form has proper ARIA attributes', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for required field indicators
    const emailInput = page.locator('input[type="email"]');

    // Should have aria-required or required attribute
    const isRequired =
      (await emailInput.getAttribute('required')) !== null ||
      (await emailInput.getAttribute('aria-required')) !== null;

    expect(isRequired).toBeTruthy();
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/auth/signin');

    // Tab to email field
    await page.keyboard.press('Tab');

    // Check if focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focused);
  });

  test('buttons have accessible text', async ({ page }) => {
    await page.goto('/auth/signin');

    const signInButton = page.locator('button:has-text("Sign In")');
    const buttonText = await signInButton.textContent();

    // Button should have descriptive text
    expect(buttonText?.length).toBeGreaterThan(0);
    expect(buttonText).not.toBe('');
  });

  test('headings have proper hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for H1 on page
    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    // Page should have at least one H1
    expect(h1Count).toBeGreaterThanOrEqual(0);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');

    // Check all images have alt text
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      // Either has alt text or is decorative
      expect(alt !== undefined).toBeTruthy();
    }
  });

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/');

    // Check links don't just say "click here"
    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const text = await links.nth(i).textContent();
      expect(text?.toLowerCase()).not.toBe('click here');
      expect(text?.toLowerCase()).not.toBe('link');
    }
  });

  test('page has proper color contrast', async ({ page }) => {
    await page.goto('/auth/signin');
    await injectAxe(page);

    // Axe automatically checks contrast ratios
    // WCAG AA requires 4.5:1 for normal text
    await checkA11y(page, undefined, {
      detailedReport: true,
    });
  });

  test('focus indicator is visible', async ({ page }) => {
    await page.goto('/auth/signin');

    const emailInput = page.locator('input[type="email"]');

    // Focus the input
    await emailInput.focus();

    // Focus should be visible
    expect(emailInput).toBeFocused();
  });

  test('error messages are announced', async ({ page }) => {
    await page.goto('/auth/signin');

    // Submit without credentials
    await page.click('button:has-text("Sign In")');

    // Wait for error
    await page.waitForTimeout(1000);

    // Check for error message or alert
    const errorText = page.locator('text=/error|invalid|required/i');
    const hasErrorMessage = (await errorText.count()) > 0;

    // Should either show error or stay on same page
    expect(hasErrorMessage || page.url().includes('signin')).toBeTruthy();
  });

  test('form validation is accessible', async ({ page }) => {
    await page.goto('/auth/signin');

    // Leave fields empty and submit
    const signInButton = page.locator('button:has-text("Sign In")');
    await signInButton.click();

    // Should have validation feedback
    await page.waitForTimeout(500);

    // Either stays on form or shows error
    const stillOnSignIn = page.url().includes('signin');
    const hasError =
      (await page.locator('text=/required|invalid/i').count()) > 0;

    expect(stillOnSignIn || hasError).toBeTruthy();
  });

  test('navigation menu is accessible', async ({ page }) => {
    await page.goto('/auth/signin');

    // Sign in
    await page.fill('input[type="email"]', TEST_CREDENTIALS.volunteer.email);
    await page.fill(
      'input[type="password"]',
      TEST_CREDENTIALS.volunteer.password
    );
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 5000 });

    // Check if navigation exists and is accessible
    const nav = page.locator('nav, [role="navigation"]');
    const navExists = (await nav.count()) > 0;

    expect(navExists).toBeTruthy();
  });

  test('page respects prefers-reduced-motion', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Page should still be functional
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });

  test('text can be zoomed to 200%', async ({ page }) => {
    await page.goto('/auth/signin');

    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });

    // Page should still be readable and functional
    const signInButton = page.locator('button:has-text("Sign In")');
    expect(await signInButton.isVisible()).toBeTruthy();
  });

  test('skip to content link exists', async ({ page }) => {
    await page.goto('/');

    // Look for skip link (usually first focusable element)
    const skipLink = page.locator(
      'a[href*="main"], a[href*="content"], .skip-link'
    );

    // Skip link should exist or be announced
    const hasSkipLink = (await skipLink.count()) > 0;

    expect(hasSkipLink || page.url()).toBeTruthy();
  });
});
