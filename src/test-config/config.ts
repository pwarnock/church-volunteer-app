/**
 * Test Environment Configuration
 *
 * Domain: Test environment setup
 * Responsibility: Centralize test environment variables and defaults
 * Boundaries: Configuration only, no business logic
 */

export const TEST_CONFIG = {
  // Base URLs for different test environments
  BASE_URL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

  // Test credentials (override with environment variables)
  CREDENTIALS: {
    VOLUNTEER_EMAIL: process.env.TEST_VOLUNTEER_EMAIL || 'volunteer@test.com',
    VOLUNTEER_PASSWORD: process.env.TEST_VOLUNTEER_PASSWORD || 'password123',
    LEADER_EMAIL: process.env.TEST_LEADER_EMAIL || 'leader@test.com',
    LEADER_PASSWORD: process.env.TEST_LEADER_PASSWORD || 'password123',
  },

  // Test timeouts
  TIMEOUTS: {
    NAVIGATION: 5000,
    ELEMENT_APPEAR: 3000,
    FORM_SUBMIT: 5000,
  },

  // Accessibility test configuration
  ACCESSIBILITY: {
    RULES: {
      // Disable specific rules for testing if needed
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
    },
  },
} as const;
