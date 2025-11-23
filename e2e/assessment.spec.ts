/**
 * Volunteer Assessment E2E Tests
 *
 * Domain: End-to-end testing
 * Responsibility: Test complete spiritual gifts assessment flow
 * Boundaries: Full user journey through assessment
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './test-credentials';

test.describe('Volunteer Assessment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as volunteer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.volunteer.email);
    await page.fill(
      'input[name="password"]',
      TEST_CREDENTIALS.volunteer.password
    );
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 10000 });
  });

  test('should complete spiritual gifts assessment', async ({ page }) => {
    // Navigate to assessment
    await page.goto('/volunteer/assessment');

    // Check assessment page loads
    await expect(page.locator('h1')).toContainText(
      'Spiritual Gifts Assessment'
    );

    // Answer first question
    await page.click(
      'text=I want to help them directly and meet their practical needs'
    );

    // Answer second question
    await page.click('text=I enjoy organizing events and coordinating people');

    // Continue through assessment (simplified for test)
    const questions = await page.locator('[data-testid="question"]').count();

    for (let i = 0; i < Math.min(questions, 5); i++) {
      // Click first option for each question
      const firstOption = page
        .locator('[data-testid="question"]')
        .nth(i)
        .locator('label')
        .first();
      await firstOption.click();

      // Wait a moment between questions
      await page.waitForTimeout(500);
    }

    // Submit assessment
    await page.click('button:has-text("Complete Assessment")');

    // Wait for results
    await page.waitForURL(/\/volunteer\/assessment\/results/, {
      timeout: 10000,
    });

    // Verify results page
    await expect(page.locator('h1')).toContainText('Your Spiritual Gifts');

    // Check that results are displayed
    await expect(page.locator('[data-testid="gifts-results"]')).toBeVisible();

    // Check for top gifts
    await expect(page.locator('text=Service')).toBeVisible();
    await expect(page.locator('text=Leadership')).toBeVisible();
  });

  test('should save assessment results to profile', async ({ page }) => {
    // Navigate to assessment
    await page.goto('/volunteer/assessment');

    // Complete assessment quickly
    await page.click(
      'text=I want to help them directly and meet their practical needs'
    );
    await page.click('text=I enjoy organizing events and coordinating people');
    await page.click('text=I feel called to pray for them and encourage them');
    await page.click(
      'text=I want to understand their situation and guide them'
    );
    await page.click('button:has-text("Complete Assessment")');

    // Wait for results
    await page.waitForURL(/\/volunteer\/assessment\/results/, {
      timeout: 10000,
    });

    // Verify save confirmation
    await expect(
      page.locator('text=Assessment saved successfully')
    ).toBeVisible();

    // Navigate to profile to verify saved data
    await page.goto('/volunteer/profile');

    // Check that assessment data is reflected
    await expect(page.locator('[data-testid="spiritual-gifts"]')).toBeVisible();
  });

  test('should handle assessment validation', async ({ page }) => {
    // Navigate to assessment
    await page.goto('/volunteer/assessment');

    // Try to submit without answering questions
    await page.click('button:has-text("Complete Assessment")');

    // Should show validation error
    await expect(
      page.locator('text=Please answer all questions')
    ).toBeVisible();

    // Answer one question and try again
    await page.click(
      'text=I want to help them directly and meet their practical needs'
    );
    await page.click('button:has-text("Complete Assessment")');

    // Should still show validation for remaining questions
    await expect(
      page.locator('text=Please answer all questions')
    ).toBeVisible();
  });

  test('should navigate between assessment and results', async ({ page }) => {
    // Complete assessment first
    await page.goto('/volunteer/assessment');
    await page.click(
      'text=I want to help them directly and meet their practical needs'
    );
    await page.click('text=I enjoy organizing events and coordinating people');
    await page.click('text=I feel called to pray for them and encourage them');
    await page.click(
      'text=I want to understand their situation and guide them'
    );
    await page.click('button:has-text("Complete Assessment")');

    // Wait for results
    await page.waitForURL(/\/volunteer\/assessment\/results/, {
      timeout: 10000,
    });

    // Verify results page content
    await expect(page.locator('h1')).toContainText('Your Spiritual Gifts');

    // Navigate back to assessment
    await page.click('text=Retake Assessment');
    await page.waitForURL(/\/volunteer\/assessment/, { timeout: 10000 });

    // Should be back on assessment page
    await expect(page.locator('h1')).toContainText(
      'Spiritual Gifts Assessment'
    );
  });

  test('should be accessible during assessment', async ({ page }) => {
    // Navigate to assessment
    await page.goto('/volunteer/assessment');

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Spiritual Gifts Assessment');

    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocusable = page.locator(':focus');
    await expect(firstFocusable).toBeVisible();

    // Check ARIA labels
    const options = page.locator('input[type="radio"]');
    const count = await options.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const option = options.nth(i);
      await expect(option).toHaveAttribute('aria-label');
    }

    // Check form accessibility
    const form = page.locator('form');
    await expect(form).toHaveAttribute('role', 'form');
  });

  test('should handle assessment errors gracefully', async ({ page }) => {
    // Mock network error for assessment submission
    await page.route('**/api/volunteer/assessment', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Navigate to assessment
    await page.goto('/volunteer/assessment');

    // Complete assessment
    await page.click(
      'text=I want to help them directly and meet their practical needs'
    );
    await page.click('text=I enjoy organizing events and coordinating people');
    await page.click('text=I feel called to pray for them and encourage them');
    await page.click(
      'text=I want to understand their situation and guide them'
    );
    await page.click('button:has-text("Complete Assessment")');

    // Should show error message
    await expect(page.locator('text=Failed to save assessment')).toBeVisible();

    // Should provide retry option
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });
});
