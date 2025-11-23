/**
 * Test credentials and configuration
 * These are demo accounts used for testing and should only be used in development/staging
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
};
