/**
 * Test Data - Applications
 *
 * Domain: Test data generation
 * Responsibility: Provide application test data
 * Boundaries: Data generation only, no business logic
 */

import { testDataFactory } from './factory';

export const applicationTestData = {
  validApplications: {
    pending: {
      opportunityId: 'opp_001',
      volunteerId: 'vol_001',
      message:
        'I am excited to serve in this ministry and believe my skills would be valuable.',
      status: 'PENDING',
    },
    approved: {
      opportunityId: 'opp_002',
      volunteerId: 'vol_002',
      message: 'Approved application with strong qualifications.',
      status: 'APPROVED',
    },
    rejected: {
      opportunityId: 'opp_003',
      volunteerId: 'vol_003',
      message: 'Application that does not meet requirements.',
      status: 'REJECTED',
    },
  },
  invalidApplications: {
    missingOpportunityId: {
      description: 'Application without opportunity ID',
      opportunityId: undefined,
    },
    emptyOpportunityId: {
      description: 'Application with empty opportunity ID',
      opportunityId: '',
    },
    tooShortMessage: {
      description: 'Application with too short message',
      opportunityId: 'opp_004',
      message: 'Hi', // Too short
    },
    noMessage: {
      description: 'Application with empty message',
      opportunityId: 'opp_005',
      message: '', // Empty message
    },
  },
  scenarios: {
    volunteerFlow: {
      apply: testDataFactory.application({ status: 'PENDING' }),
      viewStatus: testDataFactory.application({ status: 'PENDING' }),
    },
    leaderFlow: {
      approve: testDataFactory.application({ status: 'APPROVED' }),
      reject: testDataFactory.application({ status: 'REJECTED' }),
      review: [
        testDataFactory.application({ status: 'PENDING' }),
        testDataFactory.application({ status: 'APPROVED' }),
      ],
    },
  },
};
