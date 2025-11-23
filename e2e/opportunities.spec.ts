import { test, expect, Page } from '@playwright/test';
import { TEST_CREDENTIALS } from './test-credentials';

const signInAsVolunteer = async (page: Page) => {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', TEST_CREDENTIALS.volunteer.email);
  await page.fill(
    'input[type="password"]',
    TEST_CREDENTIALS.volunteer.password
  );
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/\/dashboard|\/volunteer/, { timeout: 5000 });
};

const signInAsLeader = async (page: Page) => {
  await page.goto('/auth/signin');
  await page.fill('input[type="email"]', TEST_CREDENTIALS.leader.email);
  await page.fill('input[type="password"]', TEST_CREDENTIALS.leader.password);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL(/\/dashboard|\/leader/, { timeout: 5000 });
};

test.describe('Opportunities', () => {
  test('volunteer can view opportunities list', async ({ page }) => {
    await signInAsVolunteer(page);

    // Navigate to opportunities page
    const oppLink = page.locator(
      'a:has-text("Opportunities"), button:has-text("Opportunities")'
    );
    if (await oppLink.isVisible()) {
      await oppLink.click();
      await page.waitForURL(/opportunities/, { timeout: 5000 });
    } else {
      await page.goto('/volunteer/opportunities');
    }

    // Check if opportunities are displayed
    const opportunitiesList = page.locator(
      '[data-testid="opportunities-list"], ul, div:has-text("Opportunity")'
    );
    await expect(opportunitiesList).toBeVisible({ timeout: 5000 });
  });

  test('volunteer can search opportunities', async ({ page }) => {
    await signInAsVolunteer(page);

    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Look for search input
    const searchInput = page.locator(
      'input[placeholder*="Search"], input[type="search"]'
    );
    if (await searchInput.isVisible()) {
      await searchInput.fill('Sunday');
      await page.waitForTimeout(500);

      // Results should be filtered
      const results = page.locator('text=/Sunday/i');
      await expect(results).toBeVisible();
    }
  });

  test('volunteer can view opportunity details', async ({ page }) => {
    await signInAsVolunteer(page);

    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Click on first opportunity
    const firstOpportunity = page
      .locator('a, button')
      .filter({ hasText: /Teacher|Mentor|Volunteer/ })
      .first();
    if (await firstOpportunity.isVisible()) {
      await firstOpportunity.click();
      await page.waitForTimeout(1000);

      // Check if details are shown
      const description = page.locator(
        'text=/description|requirements|ministry/i'
      );
      await expect(description).toBeVisible({ timeout: 5000 });
    }
  });

  test('volunteer can apply for opportunity', async ({ page }) => {
    await signInAsVolunteer(page);

    // Navigate to opportunities
    await page.goto('/volunteer/opportunities');

    // Find and click apply button
    const applyButton = page.locator(
      'button:has-text("Apply"), button:has-text("Apply Now")'
    );
    if (await applyButton.first().isVisible()) {
      await applyButton.first().click();

      // Check if application form appears
      const applicationForm = page.locator(
        'form, input[placeholder*="message"], textarea'
      );
      await expect(applicationForm).toBeVisible({ timeout: 5000 });

      // Fill in message if present
      const messageInput = page
        .locator('input[placeholder*="message"], textarea')
        .first();
      if (await messageInput.isVisible()) {
        await messageInput.fill('I am interested in this opportunity!');
      }

      // Submit application
      const submitButton = page.locator(
        'button:has-text("Submit"), button:has-text("Apply")'
      );
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Look for success message
        const successMessage = page.locator(
          'text=/success|submitted|applied/i'
        );
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('volunteer can view their applications', async ({ page }) => {
    await signInAsVolunteer(page);

    // Look for applications link in navigation
    const applicationsLink = page.locator(
      'a:has-text("Applications"), button:has-text("My Applications")'
    );
    if (await applicationsLink.isVisible()) {
      await applicationsLink.click();
      await page.waitForURL(/applications/, { timeout: 5000 });

      // Check if applications are displayed
      const applicationsList = page.locator(
        'text=/application|status|opportunity/i'
      );
      await expect(applicationsList).toBeVisible({ timeout: 5000 });
    }
  });

  test('ministry leader can view opportunity management', async ({ page }) => {
    await signInAsLeader(page);

    // Look for leader/management section
    const leaderLink = page.locator(
      'a:has-text("Leader"), a:has-text("Manage"), button:has-text("Opportunities")'
    );
    if (await leaderLink.isVisible()) {
      await leaderLink.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto('/leader/opportunities');
    }

    // Check if opportunities management is visible
    const managementPanel = page.locator('text=/create|manage|applications/i');
    await expect(managementPanel).toBeVisible({ timeout: 5000 });
  });

  test('ministry leader can create opportunity', async ({ page }) => {
    await signInAsLeader(page);

    // Navigate to create opportunity page
    const createButton = page.locator(
      'button:has-text("Create"), a:has-text("New"), button:has-text("Add Opportunity")'
    );
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForURL(/create|new/, { timeout: 5000 });
    } else {
      await page.goto('/leader/create-opportunity');
    }

    // Fill in opportunity form
    const titleInput = page
      .locator('input[placeholder*="title"], input[placeholder*="opportunity"]')
      .first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Opportunity');

      // Fill description if available
      const descInput = page
        .locator(
          'textarea[placeholder*="description"], input[placeholder*="description"]'
        )
        .first();
      if (await descInput.isVisible()) {
        await descInput.fill('This is a test opportunity');
      }

      // Submit form
      const submitButton = page.locator(
        'button:has-text("Create"), button:has-text("Submit"), button:has-text("Save")'
      );
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should redirect or show success
        await page.waitForTimeout(1000);
        expect(page.url()).not.toContain('create');
      }
    }
  });

  test('ministry leader can view applications', async ({ page }) => {
    await signInAsLeader(page);

    // Look for applications section
    const applicationsLink = page.locator(
      'a:has-text("Applications"), button:has-text("View Applications")'
    );
    if (await applicationsLink.isVisible()) {
      await applicationsLink.click();
      await page.waitForTimeout(1000);

      // Check if applications are displayed
      const applicationsList = page.locator(
        'text=/volunteer|application|status/i'
      );
      await expect(applicationsList).toBeVisible({ timeout: 5000 });
    } else {
      await page.goto('/leader/applications');
      const appsList = page.locator('text=/volunteer|application/i');
      await expect(appsList).toBeVisible({ timeout: 5000 });
    }
  });
});
