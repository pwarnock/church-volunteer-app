import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntegrationTestDataFactory } from '../../test-data/integration-factory';
import { prisma } from '../../lib/prisma';

describe('Database Integration Tests', () => {
  let scenario: any;

  beforeEach(async () => {
    scenario = await IntegrationTestDataFactory.createCompleteScenario();
  });

  afterEach(async () => {
    await IntegrationTestDataFactory.cleanupScenario(scenario);
  });

  describe('Data Structure Validation', () => {
    it('should return requirements as JSON string from database', async () => {
      // Use the opportunity from the scenario
      const opportunity = scenario.opportunity;

      // Verify it's stored as JSON string
      expect(typeof opportunity.requirements).toBe('string');
      expect(JSON.parse(opportunity.requirements)).toEqual(
        expect.arrayContaining(['Background check', 'Test requirement'])
      );
    });

    it('should handle volunteer profile JSON fields correctly', async () => {
      const profile = scenario.profile;

      // Verify all JSON fields are strings
      expect(typeof profile.spiritualGifts).toBe('string');
      expect(typeof profile.interests).toBe('string');
      expect(typeof profile.availability).toBe('string');
      expect(typeof profile.skills).toBe('string');

      // Verify JSON parsing works
      const gifts = JSON.parse(profile.spiritualGifts);
      const interests = JSON.parse(profile.interests);
      const availability = JSON.parse(profile.availability);
      const skills = JSON.parse(profile.skills);

      expect(Array.isArray(gifts)).toBe(true);
      expect(Array.isArray(interests)).toBe(true);
      expect(typeof availability).toBe('object');
      expect(Array.isArray(skills)).toBe(true);
    });
  });

  describe('Component Data Compatibility', () => {
    it('should provide data in format expected by OpportunityList component', async () => {
      const opportunity = scenario.opportunity;

      // This simulates what OpportunityList component expects
      const componentData = {
        ...opportunity,
        requirements: opportunity.requirements || '[]', // This is the problematic line
      };

      // Verify the data structure
      expect(typeof componentData.requirements).toBe('string');
      expect(() => {
        // This should fail - demonstrating the bug
        (componentData.requirements as any).map((req: string) => req.length);
      }).toThrow('requirements.map is not a function');

      // Correct way to handle it
      const parsedRequirements = JSON.parse(componentData.requirements);
      expect(Array.isArray(parsedRequirements)).toBe(true);
      expect(parsedRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('Query Operations with JSON Data', () => {
    it('should filter opportunities by requirements content', async () => {
      // This would work with native arrays but currently fails with JSON strings
      const opportunities = await prisma.opportunity.findMany({
        where: {
          requirements: {
            contains: 'Background check',
          },
        },
      });

      expect(opportunities.length).toBeGreaterThan(0);
      // Should find our test opportunity
      expect(
        opportunities.some((opp) => opp.title.includes('Test Opportunity'))
      ).toBe(true);
    });

    it('should handle empty requirements array', async () => {
      const emptyOpp = await IntegrationTestDataFactory.createOpportunity(
        scenario.leader.id,
        {
          title: 'Empty Requirements Test',
          description: 'Testing empty requirements',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: JSON.stringify([]),
          timeCommitment: '1 hour per week',
          status: 'ACTIVE',
        }
      );

      expect(emptyOpp.requirements).toBe('[]');
      expect(JSON.parse(emptyOpp.requirements)).toEqual([]);

      // Clean up
      await prisma.opportunity.delete({ where: { id: emptyOpp.id } });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      // Create opportunity with malformed JSON
      const opportunity = await IntegrationTestDataFactory.createOpportunity(
        scenario.leader.id,
        {
          title: 'Malformed JSON Test',
          description: 'Testing error handling',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: '{"malformed": json}', // Invalid JSON
          timeCommitment: '2 hours per week',
          status: 'ACTIVE',
        }
      );

      // Component should handle this gracefully
      expect(() => {
        JSON.parse(opportunity.requirements);
      }).toThrow();

      // Clean up
      await prisma.opportunity.delete({ where: { id: opportunity.id } });
    });

    it('should handle empty requirements string', async () => {
      const opportunity = await IntegrationTestDataFactory.createOpportunity(
        scenario.leader.id,
        {
          title: 'Empty Requirements Test',
          description: 'Testing empty requirements',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: '',
          timeCommitment: '2 hours per week',
          status: 'ACTIVE',
        }
      );

      // Component should handle empty string gracefully
      const requirements = opportunity.requirements || '[]';
      expect(() => {
        (requirements as any).map((req: string) => req);
      }).toThrow();

      // Clean up
      await prisma.opportunity.delete({ where: { id: opportunity.id } });
    });
  });
});
