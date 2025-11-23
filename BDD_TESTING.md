# BDD Testing with Cucumber & Gherkin

This project uses **Cucumber** and **Gherkin** syntax for Behavior-Driven Development (BDD) testing. BDD tests describe application behavior in human-readable language that bridges the gap between developers and stakeholders.

## What is BDD?

Behavior-Driven Development uses plain-language scenarios to describe what the application should do:

```gherkin
Scenario: Volunteer signs in with valid credentials
  Given I am on the sign in page
  When I enter email "volunteer@demo.com"
  And I enter password "password123"
  And I click the sign in button
  Then I should be redirected to the dashboard
  And I should see "Welcome" message
```

## Running BDD Tests

```bash
# Run all BDD tests
bun test:bdd

# Run specific feature file
bun test:bdd features/authentication.feature

# Run with custom test credentials
export TEST_VOLUNTEER_EMAIL="custom@example.com"
export TEST_VOLUNTEER_PASSWORD="custom-password"
bun test:bdd

# Generate HTML report
bun test:bdd --format html:test-results/cucumber-report.html
```

Test credentials are defined in `features/step_definitions/authentication.steps.ts` and can be overridden via environment variables.

## Structure

### Feature Files

- **Location**: `features/*.feature`
- **Format**: Gherkin syntax (human-readable)
- **Purpose**: Describe user-facing behavior and acceptance criteria

### Step Definitions

- **Location**: `features/step_definitions/*.ts`
- **Purpose**: Implement the logic for each Gherkin step
- **Connect**: Map feature scenarios to test implementation

## Feature Files

### 1. Authentication (`features/authentication.feature`)

Tests user sign-in, sign-out, and session management:

- **Volunteer sign in** - Valid credentials
- **Ministry leader sign in** - Valid credentials
- **Invalid email** - Proper error handling
- **Invalid password** - Proper error handling
- **Empty fields** - Validation errors
- **Session maintenance** - User stays signed in
- **Sign out** - Session is cleared

### 2. Opportunities (`features/opportunities.feature`)

Tests volunteer opportunity browsing and application:

- **View opportunities** - List displays correctly
- **Filter opportunities** - By ministry type
- **Apply for opportunity** - Submit application
- **Prevent duplicate applications** - Can't apply twice
- **View applications** - See application history
- **Requirements display** - Clear presentation
- **Ministry leader creation** - Create new opportunities

## Gherkin Keywords

- **Feature**: Top-level test suite describing a user feature
- **Scenario**: Individual test case with specific behavior
- **Given**: Preconditions (the context/setup)
- **When**: Actions (what the user does)
- **Then**: Assertions (expected outcomes)
- **And/But**: Extends previous step with same type
- **Background**: Shared setup for all scenarios in a feature

## Example Scenario

```gherkin
Feature: User Authentication
  As a user
  I want to sign in securely
  So that I can access the application

  Background:
    Given the application is running
    And demo users exist in the database

  Scenario: Volunteer signs in with valid credentials
    Given I am on the sign in page
    When I enter email "volunteer@demo.com"
    And I enter password "password123"
    And I click the sign in button
    Then I should be redirected to the dashboard
```

## Writing New BDD Tests

### 1. Create a Feature File

```gherkin
# features/my-feature.feature
Feature: New Feature Name
  As a [user type]
  I want to [action]
  So that [benefit]

  Scenario: Description of behavior
    Given [precondition]
    When [action]
    Then [expected result]
```

### 2. Create Step Definitions

```typescript
// features/step_definitions/my-feature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';

Given('a precondition', function () {
  // Setup logic
});

When('an action', function () {
  // Action logic
});

Then('expected result', function () {
  // Assertion
});
```

### 3. Run Tests

```bash
bun test:bdd
```

## Best Practices

1. **Write scenarios from user perspective** - Use "I should see", not "assert element exists"
2. **Keep steps reusable** - Each step should be simple and standalone
3. **Use data tables for multiple scenarios** - Avoid repetition
4. **Avoid technical details** - Focus on behavior, not implementation
5. **One assertion per Then** - Make failures clear
6. **Background for common setup** - DRY principle for preconditions

## Integration with Unit Tests

- **Unit Tests** (`bun test`): Test individual functions and components
- **BDD Tests** (`bun test:bdd`): Test complete user workflows
- **Run both**: `bun test && bun test:bdd`

## Reports

HTML reports are generated in `test-results/cucumber-report.html` showing:

- Scenario status (passed/failed)
- Execution time
- Step-by-step results
- Error details and stack traces

## Resources

- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
