/**
 * Test Data Factory
 *
 * Domain: Test data generation
 * Responsibility: Generate consistent, parameterized test data
 * Boundaries: Data generation only, no business logic
 */

import { testDataStorage } from './storage';

// Base test data structures
export const baseTestData = {
  applications: {
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
  users: {
    volunteer: {
      id: 'vol_001',
      email: 'volunteer@test.com',
      name: 'Test Volunteer',
      role: 'VOLUNTEER',
    },
    leader: {
      id: 'lead_001',
      email: 'leader@test.com',
      name: 'Test Leader',
      role: 'LEADER',
    },
    unauthenticated: null,
  },
  opportunities: {
    active: {
      id: 'opp_001',
      title: 'Youth Ministry Assistant',
      description: 'Help with youth programs and activities',
      ministry: 'Youth Ministry',
      location: 'Main Church Building',
      requirements: [
        'Background check',
        'Love for youth',
        'Weekly availability',
      ],
      timeCommitment: '3 hours per week',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      status: 'ACTIVE',
      leaderId: 'lead_001',
    },
    expired: {
      id: 'opp_002',
      title: 'Past Event',
      description: 'An opportunity that has already ended',
      ministry: 'Outreach',
      location: 'Community Center',
      requirements: ['Event planning skills'],
      timeCommitment: 'One-time event',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: 'COMPLETED',
      leaderId: 'lead_001',
    },
  },
  profiles: {
    complete: {
      bio: 'Experienced volunteer with passion for youth ministry',
      spiritualGifts: 'Teaching, Leadership, Mercy',
      interests: 'Youth programs, Community outreach, Music ministry',
      availability: 'Weekday evenings, Weekend mornings',
      skills: 'Event planning, Public speaking, Mentorship',
      experience: '5+ years volunteering in various church ministries',
    },
    minimal: {
      bio: 'New volunteer eager to serve',
      spiritualGifts: 'Service, Hospitality',
      interests: 'Helping others',
      availability: 'Flexible',
      skills: 'Basic organizational skills',
      experience: 'New to volunteering',
    },
  },
  assessments: {
    completed: {
      gifts: ['Teaching', 'Leadership', 'Mercy'],
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    recent: {
      gifts: ['Service', 'Hospitality'],
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    partial: {
      gifts: ['Teaching'],
      completedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  },
};

// Test data factory functions
export const testDataFactory = {
  // Generate application test data
  application: (overrides: Partial<any> = {}) => {
    const base = baseTestData.applications.pending;
    return { ...base, ...overrides };
  },

  // Generate user test data
  user: (
    type: 'volunteer' | 'leader' | 'unauthenticated' = 'volunteer',
    overrides: Partial<any> = {}
  ) => {
    const base = baseTestData.users[type];
    return base ? { ...base, ...overrides } : null;
  },

  // Generate opportunity test data
  opportunity: (
    type: 'active' | 'expired' = 'active',
    overrides: Partial<any> = {}
  ) => {
    const base = baseTestData.opportunities[type];
    return { ...base, ...overrides };
  },

  // Generate profile test data
  profile: (
    type: 'complete' | 'minimal' = 'complete',
    overrides: Partial<any> = {}
  ) => {
    const base = baseTestData.profiles[type];
    return { ...base, ...overrides };
  },

  // Generate assessment test data
  assessment: (
    type: 'completed' | 'recent' | 'partial' = 'completed',
    overrides: Partial<any> = {}
  ) => {
    const base = baseTestData.assessments[type];
    return { ...base, ...overrides };
  },
};

// Main test data generation function
export function generateTestData(
  type: string,
  overrides: Partial<any> = {}
): any {
  switch (type) {
    case 'application':
      return testDataFactory.application(overrides);
    case 'user':
      return testDataFactory.user(overrides.role as any, overrides);
    case 'opportunity':
      return testDataFactory.opportunity(overrides.status as any, overrides);
    case 'profile':
      return testDataFactory.profile(overrides.completeness as any, overrides);
    case 'assessment':
      return testDataFactory.assessment(overrides.completion as any, overrides);
    default:
      throw new Error(`Unknown test data type: ${type}`);
  }
}

// Load test data from storage
export function loadTestData(type: string, scenario: string): any {
  return testDataStorage.load(type, scenario);
}

// Save test data to storage
export function saveTestData(type: string, scenario: string, data: any): void {
  testDataStorage.save(type, data);
}

// Generate parameterized test scenarios
export function generateTestScenarios(
  type: string
): Array<{ name: string; data: any }> {
  // For now, return basic scenarios from baseTestData
  switch (type) {
    case 'applications':
      return [
        { name: 'pending', data: baseTestData.applications.pending },
        { name: 'approved', data: baseTestData.applications.approved },
        { name: 'rejected', data: baseTestData.applications.rejected },
      ];
    case 'users':
      return [
        { name: 'volunteer', data: baseTestData.users.volunteer },
        { name: 'leader', data: baseTestData.users.leader },
      ];
    case 'opportunities':
      return [
        { name: 'active', data: baseTestData.opportunities.active },
        { name: 'expired', data: baseTestData.opportunities.expired },
      ];
    default:
      return [];
  }
}
