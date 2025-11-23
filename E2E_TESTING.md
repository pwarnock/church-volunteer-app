# End-to-End Testing with Playwright

This project uses **Playwright** for End-to-End (E2E) testing. E2E tests simulate real user interactions with the application, testing complete workflows across the UI.

## What is E2E Testing?

E2E tests validate the entire application flow from a user's perspective:

- User authentication (sign in/out)
- Navigation between pages
- Form submissions
- Data persistence
- Error handling

Unlike unit tests (which test individual functions), E2E tests run against a fully functional application in a browser.

## Running E2E Tests

```bash
# Run all E2E tests
bun test:e2e

# Run tests in UI mode (interactive)
bun test:e2e:ui

# Run tests in debug mode (step-by-step)
bun test:e2e:debug

# Run specific test file
bun test:e2e e2e/auth.spec.ts

# Run tests matching a pattern
bun test:e2e --grep "sign in"

# Run tests in specific browser
bun test:e2e --project=chromium
bun test:e2e --project=firefox
bun test:e2e --project=webkit
```

## Project Setup

The E2E tests are configured to:

- Run against `http://localhost:3000` (automatically started, configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- Test in multiple browsers (Chromium, Firefox, WebKit)
- Test on mobile viewports (Pixel 5, iPhone 12)
- Screenshot failures
- Record videos on failure
- Generate HTML reports

### Test Credentials

Test credentials are centralized in `e2e/test-credentials.ts` and can be overridden with environment variables:

```typescript
// Default credentials (from e2e/test-credentials.ts)
TEST_VOLUNTEER_EMAIL: 'volunteer@demo.com';
TEST_VOLUNTEER_PASSWORD: 'password123';
TEST_LEADER_EMAIL: 'leader@demo.com';
TEST_LEADER_PASSWORD: 'password123';
```

Override in your environment:

```bash
export TEST_VOLUNTEER_EMAIL="custom@example.com"
export TEST_VOLUNTEER_PASSWORD="custom-password"
bun test:e2e
```

Or create a `.env.test` file from `.env.test.example`.

## Test Files

### 1. Authentication (`e2e/auth.spec.ts`)

Tests user sign-in, sign-out, and session management:

- **Sign-in page display** - Verify form elements
- **Volunteer sign in** - Valid credentials flow
- **Ministry leader sign in** - Valid credentials flow
- **Invalid credentials** - Error handling
- **Required fields** - Email and password validation
- **Sign out** - Session cleanup
- **Session persistence** - Stays signed in after refresh

### 2. Opportunities (`e2e/opportunities.spec.ts`)

Tests volunteer opportunity browsing and management:

- **View opportunities** - List displays correctly
- **Search opportunities** - Filter by keyword
- **View details** - Opportunity detail page
- **Apply for opportunity** - Submission flow
- **View applications** - Application history
- **Leader management** - Create and view opportunities
- **View applications (leader)** - Review volunteer applications

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('specific behavior', async ({ page }) => {
    // Navigate
    await page.goto('/path');

    // Interact
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Sign In")');

    // Assert
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Common Patterns

### Navigate to page

```typescript
await page.goto('/auth/signin');
```

### Fill form fields

```typescript
import { TEST_CREDENTIALS } from './test-credentials';

await page.fill('input[type="email"]', TEST_CREDENTIALS.volunteer.email);
await page.fill('input[type="password"]', TEST_CREDENTIALS.volunteer.password);
```

Always use `TEST_CREDENTIALS` from `e2e/test-credentials.ts` instead of hardcoding credentials.

### Click buttons

```typescript
await page.click('button:has-text("Sign In")');
```

### Wait for navigation

```typescript
await page.waitForURL('/dashboard');
```

### Check visibility

```typescript
await expect(page.locator('text=Welcome')).toBeVisible();
```

### Take screenshot

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

## Writing New E2E Tests

### 1. Create a test file

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('does something', async ({ page }) => {
    await page.goto('/');
    // Your test steps...
  });
});
```

### 2. Run tests

```bash
bun test:e2e
```

### 3. Debug failures

```bash
bun test:e2e:debug
```

## Reports

After running tests, an HTML report is generated at `playwright-report/index.html`:

- Test results (passed/failed)
- Execution time
- Screenshots of failures
- Video recordings of failures
- Full trace for debugging

View the report:

```bash
npx playwright show-report
```

## Best Practices

1. **Use meaningful selectors** - Prefer text/accessible selectors over CSS
2. **Wait for elements** - Use `waitForURL`, `waitForSelector`, etc.
3. **Setup and teardown** - Use `beforeEach`, `afterEach` for common actions
4. **Avoid hardcoded waits** - Use Playwright's auto-waiting
5. **Keep tests focused** - One feature per test
6. **Test user workflows** - Not implementation details
7. **Use data attributes** - Add `data-testid` to make selectors stable

## Testing with localhost

The tests automatically start the dev server before running:

```typescript
webServer: {
  command: 'bun run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
}
```

To manually start and test:

```bash
# Terminal 1: Start dev server
bun run dev

# Terminal 2: Run tests
bun test:e2e
```

## Testing on Production

To test against production:

```bash
# Set environment variable
export PLAYWRIGHT_TEST_BASE_URL="https://your-production-url.com"

# Run tests
bun test:e2e
```

Or update credentials if production has different test accounts:

```bash
export PLAYWRIGHT_TEST_BASE_URL="https://your-production-url.com"
export TEST_VOLUNTEER_EMAIL="prod-volunteer@example.com"
export TEST_VOLUNTEER_PASSWORD="prod-password"
bun test:e2e
```

## Continuous Integration

In CI/CD pipelines, tests run with:

- `retries: 2` - Retry failed tests
- `workers: 1` - Sequential execution
- Video/screenshot recording enabled
- HTML report generation

## Selectors

Common selector patterns:

```typescript
// By text
page.locator('text=Sign In');
page.locator('button:has-text("Click me")');

// By role
page.locator('role=button[name="Submit"]');
page.locator('role=textbox[name="Email"]');

// By test ID
page.locator('[data-testid="submit-btn"]');

// By CSS
page.locator('input[type="email"]');

// By XPath
page.locator('//button[@class="submit"]');

// Combined
page.locator('form input[type="email"]').first();
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
- [Debug Tests](https://playwright.dev/docs/debug)
