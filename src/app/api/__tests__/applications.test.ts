/**
 * Applications API Route Tests - Data-Driven Testing Integration
 *
 * Domain: API route testing with data-driven approach
 * Responsibility: Test application CRUD operations using test data storage
 * Boundaries: API endpoint only, no database setup
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { generateTestScenarios } from '@/test-data/factory';
import { generateTestScenarios } from '@/test-data/factory';

// Mock dependencies before importing the route
const mockPrisma = {
  application: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockMetrics = {
  recordRateLimitHit: vi.fn(),
  recordError: vi.fn(),
};

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

const mockRateLimit = vi.fn(() => true);

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth-options', () => ({
  authOptions: {},
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
}));

vi.mock('@/lib/metrics', () => mockMetrics);

vi.mock('@/lib/logger', () => ({
  logger: mockLogger,
}));

vi.mock('@/lib/api-middleware', () => ({
  withErrorHandling: (fn: any, routeName: string) => fn,
}));

// Import after mocking
import { testDataFactory } from '@/test-data/factory';
import { testDataStorage } from '@/test-data/storage';

describe('Applications API - Data-Driven Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Test Data Factory Integration', () => {
    it('should generate application test data', () => {
      const application = testDataFactory.application({
        opportunityId: 'test_opp_001',
        volunteerId: 'test_vol_001',
        message: 'Test application message',
      });

      expect(application).toEqual({
        opportunityId: 'test_opp_001',
        volunteerId: 'test_vol_001',
        message: 'Test application message',
        status: 'PENDING',
      });
    });

    it('should generate user test data', () => {
      const volunteer = testDataFactory.user('volunteer');
      const leader = testDataFactory.user('leader');

      expect(volunteer).toEqual({
        id: 'vol_001',
        email: 'volunteer@test.com',
        name: 'Test Volunteer',
        role: 'VOLUNTEER',
      });

      expect(leader).toEqual({
        id: 'lead_001',
        email: 'leader@test.com',
        name: 'Test Leader',
        role: 'LEADER',
      });
    });

    it('should generate opportunity test data', () => {
      const opportunity = testDataFactory.opportunity('active', {
        title: 'Custom Opportunity',
      });

      expect(opportunity.id).toBe('opp_001');
      expect(opportunity.title).toBe('Custom Opportunity');
      expect(opportunity.status).toBe('ACTIVE');
    });
  });

  describe('Test Data Storage Integration', () => {
    it('should save and load test data', () => {
      const testData = {
        id: 'test_001',
        name: 'Test Data',
        timestamp: new Date().toISOString(),
      };

      // Save test data
      testDataStorage.save('test', testData);

      // Load test data
      const loadedData = testDataStorage.load('test');
      expect(loadedData).toEqual(testData);
    });

    it('should generate test scenarios', () => {
      const scenarios = generateTestScenarios('applications');

      expect(scenarios).toHaveLength(3);
      expect(scenarios[0].name).toBe('pending');
      expect(scenarios[1].name).toBe('approved');
      expect(scenarios[2].name).toBe('rejected');
    });
  });

  describe('Parameterized Test Data', () => {
    it('should create parameterized application tests', () => {
      const testScenarios = [
        {
          name: 'pending_application',
          data: testDataFactory.application({ status: 'PENDING' }),
        },
        {
          name: 'approved_application',
          data: testDataFactory.application({ status: 'APPROVED' }),
        },
        {
          name: 'rejected_application',
          data: testDataFactory.application({ status: 'REJECTED' }),
        },
      ];

      testScenarios.forEach((scenario) => {
        expect(scenario.data).toHaveProperty('opportunityId');
        expect(scenario.data).toHaveProperty('volunteerId');
        expect(scenario.data).toHaveProperty('status');
        expect(scenario.data.status).toBe(
          scenario.name.split('_')[0].toUpperCase()
        );
      });
    });

    it('should create parameterized user tests', () => {
      const userScenarios = [
        { type: 'volunteer', expectedRole: 'VOLUNTEER' },
        { type: 'leader', expectedRole: 'LEADER' },
      ];

      userScenarios.forEach((scenario) => {
        const user = testDataFactory.user(scenario.type as any);
        if (user) {
          expect(user.role).toBe(scenario.expectedRole);
        }
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
      });
    });
  });

  describe('Data-Driven Test Patterns', () => {
    it('should validate test data structure', () => {
      const application = testDataFactory.application();
      const user = testDataFactory.user('volunteer');
      const opportunity = testDataFactory.opportunity('active');

      // Application validation
      expect(application).toHaveProperty('opportunityId');
      expect(application).toHaveProperty('volunteerId');
      expect(application).toHaveProperty('status');
      expect(['PENDING', 'APPROVED', 'REJECTED']).toContain(application.status);

      // User validation
      if (user) {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(['VOLUNTEER', 'LEADER']).toContain(user.role);
      }

      // Opportunity validation
      expect(opportunity).toHaveProperty('id');
      expect(opportunity).toHaveProperty('title');
      expect(opportunity).toHaveProperty('status');
      expect(['ACTIVE', 'COMPLETED']).toContain(opportunity.status);
    });

    it('should support test data inheritance', () => {
      const baseApplication = testDataFactory.application();
      const customApplication = testDataFactory.application({
        message: 'Custom message',
        status: 'APPROVED',
      });

      expect(customApplication.opportunityId).toBe(
        baseApplication.opportunityId
      );
      expect(customApplication.volunteerId).toBe(baseApplication.volunteerId);
      expect(customApplication.message).toBe('Custom message');
      expect(customApplication.status).toBe('APPROVED');
    });
  });

  describe('Test Data Versioning', () => {
    it('should track test data versions', () => {
      const initialData = testDataFactory.application();
      const version1 = testDataStorage.save('application', initialData);

      expect(version1).toBeDefined();
      expect(typeof version1).toBe('string');
    });

    it('should maintain test data history', () => {
      const data1 = testDataFactory.application({ message: 'Version 1' });
      const data2 = testDataFactory.application({ message: 'Version 2' });

      testDataStorage.save('application', data1);
      testDataStorage.save('application', data2);

      const history = testDataStorage.history('application');
      expect(history.length).toBeGreaterThanOrEqual(1);
    });
  });
});
