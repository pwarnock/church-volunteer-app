/**
 * Application Management E2E Tests
 *
 * Domain: End-to-end testing
 * Responsibility: Test volunteer application flow and leader management
 * Boundaries: Complete application lifecycle
 */

import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './test-credentials';

test.describe('Application Management Flow', () => {
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

  test('volunteer should browse and apply for opportunities', async ({
    page,
  }) => {
    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Check opportunities page loads
    await expect(page.locator('h1')).toContainText('Volunteer Opportunities');

    // Look for available opportunities
    const opportunityCards = page.locator('[data-testid^="opportunity-card-"]');
    await expect(opportunityCards.first()).toBeVisible();

    // Click on first opportunity's apply button
    const firstOpportunityId = await opportunityCards
      .first()
      .getAttribute('data-testid');
    const opportunityId = firstOpportunityId?.replace('opportunity-card-', '');

    // Handle alert and click apply button
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Application submitted successfully');
      await dialog.accept();
    });

    await page.locator(`[data-testid="apply-button-${opportunityId}"]`).click();

    // Should update button to show applied status
    await expect(
      page.locator(`[data-testid="apply-button-${opportunityId}"]`)
    ).toContainText('Applied');
  });

  test('volunteer should view their applications', async ({ page }) => {
    // Navigate to volunteer dashboard
    await page.goto('/volunteer');

    // Check for applications section
    const applicationsSection = page.locator('[data-testid="my-applications"]');
    await expect(applicationsSection).toBeVisible();

    // Should show application status
    const applicationCards = page.locator('[data-testid="application-card"]');
    const count = await applicationCards.count();

    if (count > 0) {
      // Check first application details
      const firstCard = applicationCards.first();
      await expect(
        firstCard.locator('[data-testid="application-status"]')
      ).toBeVisible();
      await expect(
        firstCard.locator('[data-testid="opportunity-title"]')
      ).toBeVisible();
    }
  });

  test('leader should view and manage applications', async ({ page }) => {
    // Sign in as leader
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.leader.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.leader.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard|\/leader/, { timeout: 10000 });

    // Navigate to applications
    await page.goto('/leader/applications');

    // Check applications page loads
    await expect(page.locator('h1')).toContainText('Volunteer Applications');

    // Should show application list
    const applicationCards = page.locator('[data-testid="application-card"]');
    await expect(applicationCards.first()).toBeVisible();

    // Check for application details
    const firstCard = applicationCards.first();
    await expect(
      firstCard.locator('[data-testid="volunteer-name"]')
    ).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="opportunity-title"]')
    ).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="application-status"]')
    ).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="application-message"]')
    ).toBeVisible();
  });

  test('leader should approve and reject applications', async ({ page }) => {
    // Sign in as leader
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.leader.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.leader.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard|\/leader/, { timeout: 10000 });

    // Navigate to applications
    await page.goto('/leader/applications');

    // Find first application
    const applicationCards = page.locator('[data-testid="application-card"]');
    const firstCard = applicationCards.first();

    // Check for action buttons
    const approveButton = firstCard.locator('button:has-text("Approve")');
    const rejectButton = firstCard.locator('button:has-text("Reject")');

    await expect(approveButton).toBeVisible();
    await expect(rejectButton).toBeVisible();

    // Test approval
    await approveButton.click();

    // Should show confirmation dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('text=Approve this application?')).toBeVisible();

    // Confirm approval
    await page.click('button:has-text("Confirm")');

    // Should show success message
    await expect(page.locator('text=Application approved')).toBeVisible();

    // Status should update
    await expect(
      firstCard.locator('[data-testid="application-status"]')
    ).toContainText('APPROVED');

    // Approve button should be gone
    await expect(approveButton).not.toBeVisible();
  });

  test('should handle application validation', async ({ page }) => {
    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Click on first opportunity
    const opportunityCards = page.locator('[data-testid="opportunity-card"]');
    await opportunityCards.first().click();

    // Click apply button
    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Try to submit without message
    await page.click('button:has-text("Submit Application")');

    // Should show validation error
    await expect(page.locator('text=Please provide a message')).toBeVisible();

    // Fill with very short message
    await page.fill('textarea[name="message"]', 'Hi');
    await page.click('button:has-text("Submit Application")');

    // Should show minimum length error
    await expect(
      page.locator('text=Message must be at least 10 characters')
    ).toBeVisible();

    // Fill with valid message
    await page.fill(
      'textarea[name="message"]',
      'I would love to serve in this ministry and contribute my skills.'
    );
    await page.click('button:has-text("Submit Application")');

    // Should submit successfully
    await expect(
      page.locator('text=Application submitted successfully')
    ).toBeVisible();
  });

  test('should be accessible during application flow', async ({ page }) => {
    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Ministry Opportunities');

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    const firstFocusable = page.locator(':focus');
    await expect(firstFocusable).toBeVisible();

    // Check ARIA labels on opportunity cards
    const cards = page.locator('[data-testid="opportunity-card"]');
    const firstCard = cards.first();
    await expect(firstCard).toHaveAttribute('role', 'button');
    await expect(firstCard).toHaveAttribute('tabindex', '0');

    // Navigate to application form
    await firstCard.click();
    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Check form accessibility
    const form = page.locator('[data-testid="application-form"]');
    await expect(form).toBeVisible();

    const textarea = form.locator('textarea[name="message"]');
    await expect(textarea).toHaveAttribute('aria-label');
    await expect(textarea).toHaveAttribute('required');
  });

  test('should handle application errors gracefully', async ({ page }) => {
    // Mock network error for application submission
    await page.route('**/api/applications', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Try to apply
    const opportunityCards = page.locator('[data-testid="opportunity-card"]');
    await opportunityCards.first().click();

    const applyButton = page.locator('button:has-text("Apply")');
    await applyButton.click();

    // Fill and submit form
    await page.fill('textarea[name="message"]', 'Test application message');
    await page.click('button:has-text("Submit Application")');

    // Should show error message
    await expect(
      page.locator('text=Failed to submit application')
    ).toBeVisible();

    // Should provide retry option
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });
});
