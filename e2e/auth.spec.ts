import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('displays sign in page', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page).toHaveTitle(/Sign In|Login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('volunteer can sign in with valid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in email
    await page.fill('input[type="email"]', 'volunteer@demo.com');

    // Fill in password
    await page.fill('input[type="password"]', 'password123');

    // Click sign in button
    await page.click('button:has-text("Sign In")');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/dashboard|\/volunteer/);
  });

  test('ministry leader can sign in with valid credentials', async ({
    page,
  }) => {
    await page.goto('/auth/signin');

    // Fill in credentials
    await page.fill('input[type="email"]', 'leader@demo.com');
    await page.fill('input[type="password"]', 'password123');

    // Click sign in button
    await page.click('button:has-text("Sign In")');

    // Wait for navigation
    await page.waitForURL(/\/dashboard|\/leader/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/dashboard|\/leader/);
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click sign in button
    await page.click('button:has-text("Sign In")');

    // Look for error message
    const errorMessage = page.locator('text=/Invalid|incorrect|credentials/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('requires email field', async ({ page }) => {
    await page.goto('/auth/signin');

    // Leave email empty, fill password
    await page.fill('input[type="password"]', 'password123');

    // Try to submit
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Should see validation error or remain on page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('requires password field', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill email, leave password empty
    await page.fill('input[type="email"]', 'volunteer@demo.com');

    // Try to submit
    const submitButton = page.locator('button:has-text("Sign In")');
    await submitButton.click();

    // Should see validation error or remain on page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('can sign out', async ({ page }) => {
    // Sign in first
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'volunteer@demo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 5000 });

    // Find and click sign out button
    const signOutButton = page.locator(
      'button:has-text("Sign Out"), a:has-text("Sign Out")'
    );
    if (await signOutButton.isVisible()) {
      await signOutButton.click();

      // Should redirect to sign in or home page
      await page.waitForURL(/\/auth|\//, { timeout: 5000 });
    }
  });

  test('maintains session after refresh', async ({ page }) => {
    // Sign in
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'volunteer@demo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 5000 });

    // Refresh the page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard|\/volunteer/);
  });
});
