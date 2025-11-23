/**
 * Test Credentials Module
 *
 * Domain: Test authentication
 * Responsibility: Provide test user credentials for E2E tests
 * Boundaries: Credentials only, no authentication logic
 */

export const TEST_CREDENTIALS = {
  volunteer: {
    email: process.env.TEST_VOLUNTEER_EMAIL || 'volunteer@demo.com',
    password: process.env.TEST_VOLUNTEER_PASSWORD || 'password123',
  },
  leader: {
    email: process.env.TEST_LEADER_EMAIL || 'leader@demo.com',
    password: process.env.TEST_LEADER_PASSWORD || 'password123',
  },
  secondVolunteer: {
    email: process.env.TEST_SECOND_VOLUNTEER_EMAIL || 'mike@demo.com',
    password: process.env.TEST_SECOND_VOLUNTEER_PASSWORD || 'password123',
  },
  invalid: {
    email: 'invalid@test.com',
    password: 'wrongpassword',
  },
} as const;
