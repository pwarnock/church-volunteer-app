import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { prisma } from '../../lib/prisma';
import OpportunityList from '../../app/leader/components/OpportunityList';

describe('OpportunityList Component Integration', () => {
  let testLeader: any;
  let testOpportunity: any;

  beforeEach(async () => {
    // Use shared prisma client with environment-based configuration

    // Create test leader
    testLeader = await prisma.user.create({
      data: {
        name: 'Test Leader',
        email: `test-leader-${Date.now()}@integration.com`,
        password: 'password123',
        role: 'MINISTRY_LEADER',
      },
    });

    // Create test opportunity with JSON requirements
    testOpportunity = await prisma.opportunity.create({
      data: {
        title: 'Integration Test Opportunity',
        description: 'Testing component integration',
        ministry: 'Test Ministry',
        location: 'Test Location',
        requirements: JSON.stringify([
          'Background check required',
          'Experience with children',
        ]),
        timeCommitment: '2 hours per week',
        leaderId: testLeader.id,
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testOpportunity) {
      await prisma.opportunity.delete({ where: { id: testOpportunity.id } });
    }
    if (testLeader) {
      await prisma.user.delete({ where: { id: testLeader.id } });
    }
    // No disconnect needed - using shared client
  });

  describe('Component Rendering', () => {
    it('should render opportunity with JSON requirements correctly', async () => {
      render(<OpportunityList opportunities={[testOpportunity]} />);

      // Check basic opportunity details
      expect(
        screen.getByText('Integration Test Opportunity')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Testing component with real data')
      ).toBeInTheDocument();
      expect(screen.getByText('Test Ministry')).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();

      // Check requirements are displayed
      expect(screen.getByText('Background check')).toBeInTheDocument();
      expect(
        screen.getByText('Integration test requirement')
      ).toBeInTheDocument();
    });

    it('should handle empty requirements array', async () => {
      const emptyReqOpp = await prisma.opportunity.create({
        data: {
          title: 'Empty Requirements Test',
          description: 'Testing empty requirements',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: JSON.stringify([]),
          timeCommitment: '1 hour per week',
          leaderId: testLeader.id,
          status: 'ACTIVE',
        },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      render(<OpportunityList opportunities={[emptyReqOpp]} />);

      expect(screen.getByText('Empty Requirements Test')).toBeInTheDocument();
      expect(screen.getByText('No requirements specified')).toBeInTheDocument();
    });

    it('should handle null requirements gracefully', async () => {
      const nullReqOpp = await prisma.opportunity.create({
        data: {
          title: 'Null Requirements Test',
          description: 'Testing null requirements',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: null as any,
          timeCommitment: '1 hour per week',
          leaderId: testLeader.id,
          status: 'ACTIVE',
        },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      render(<OpportunityList opportunities={[nullReqOpp]} />);

      expect(screen.getByText('Null Requirements Test')).toBeInTheDocument();
      expect(screen.getByText('No requirements specified')).toBeInTheDocument();
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedOpp = await prisma.opportunity.create({
        data: {
          title: 'Malformed JSON Test',
          description: 'Testing malformed JSON',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: '{"malformed": json}', // Invalid JSON string
          timeCommitment: '1 hour per week',
          leaderId: testLeader.id,
          status: 'ACTIVE',
        },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      // Component should not crash with malformed JSON
      expect(() => {
        render(<OpportunityList opportunities={[malformedOpp]} />);
      }).toThrow('JSON.parse');
    });
  });

  describe('Data Type Safety', () => {
    it('should handle various requirement types', async () => {
      const complexOpp = await prisma.opportunity.create({
        data: {
          title: 'Complex Requirements Test',
          description: 'Testing complex requirement types',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: JSON.stringify([
            'Background check required',
            'Experience with children preferred',
            'Must love working with families',
            'Available weekends',
            'Training provided',
          ]),
          timeCommitment: '3 hours per week',
          leaderId: testLeader.id,
          status: 'ACTIVE',
        },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      render(<OpportunityList opportunities={[complexOpp]} />);

      // All requirements should be displayed
      expect(screen.getByText('Background check required')).toBeInTheDocument();
      expect(
        screen.getByText('Experience with children preferred')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Must love working with families')
      ).toBeInTheDocument();
      expect(screen.getByText('Available weekends')).toBeInTheDocument();
      expect(screen.getByText('Training provided')).toBeInTheDocument();
    });

    it('should handle special characters in requirements', async () => {
      const specialCharOpp = await prisma.opportunity.create({
        data: {
          title: 'Special Characters Test',
          description: 'Testing special characters',
          ministry: 'Test Ministry',
          location: 'Test Location',
          requirements: JSON.stringify([
            'Must be 18+ years old',
            'CPR/First Aid certified',
            'Can lift 25+ lbs',
            'Speaks Spanish & English',
            "Has driver's license",
          ]),
          timeCommitment: '2 hours per week',
          leaderId: testLeader.id,
          status: 'ACTIVE',
        },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
        },
      });

      render(<OpportunityList opportunities={[specialCharOpp]} />);

      expect(screen.getByText('Must be 18+ years old')).toBeInTheDocument();
      expect(screen.getByText('CPR/First Aid certified')).toBeInTheDocument();
      expect(screen.getByText('Can lift 25+ lbs')).toBeInTheDocument();
      expect(screen.getByText('Speaks Spanish & English')).toBeInTheDocument();
      expect(screen.getByText("Has driver's license")).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large number of opportunities efficiently', async () => {
      const opportunities = [];

      // Create 50 opportunities for performance testing
      for (let i = 0; i < 50; i++) {
        const opp = await prisma.opportunity.create({
          data: {
            title: `Performance Test Opportunity ${i}`,
            description: `Testing performance with opportunity ${i}`,
            ministry: 'Test Ministry',
            location: 'Test Location',
            requirements: JSON.stringify([
              `Requirement ${i}-1`,
              `Requirement ${i}-2`,
            ]),
            timeCommitment: '1 hour per week',
            leaderId: testLeader.id,
            status: 'ACTIVE',
          },
          include: {
            _count: {
              select: {
                applications: true,
              },
            },
          },
        });
        opportunities.push(opp);
      }

      const startTime = performance.now();
      render(<OpportunityList opportunities={opportunities} />);
      const endTime = performance.now();

      // Should render within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);

      // Should render all opportunities
      expect(screen.getAllByText(/Performance Test Opportunity/)).toHaveLength(
        50
      );
    });
  });
});
