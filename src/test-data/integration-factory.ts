import { prisma } from '../lib/prisma';

/**
 * Integration Test Data Factory
 *
 * Domain: Integration testing infrastructure
 * Responsibility: Create real database records with proper foreign key relationships
 * Boundaries: Integration test setup only
 */

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface TestScenario {
  leader: TestUser;
  volunteer: TestUser;
  opportunity: any;
  profile: any;
  application?: any;
}

export class IntegrationTestDataFactory {
  private static counter = 0;

  static getNextId() {
    return ++this.counter;
  }

  static async createUser(overrides?: Partial<TestUser>): Promise<TestUser> {
    const id = this.getNextId();
    return prisma.user.create({
      data: {
        email: `test-user-${id}-${Date.now()}@test.com`,
        name: `Test User ${id}`,
        password: 'hashedpassword',
        role: 'VOLUNTEER',
        ...overrides,
      },
    });
  }

  static async createLeader(overrides?: Partial<TestUser>): Promise<TestUser> {
    const id = this.getNextId();
    return prisma.user.create({
      data: {
        email: `test-leader-${id}-${Date.now()}@test.com`,
        name: `Test Leader ${id}`,
        password: 'hashedpassword',
        role: 'LEADER',
        ...overrides,
      },
    });
  }

  static async createOpportunity(leaderId: string, overrides?: any) {
    const id = this.getNextId();
    const baseData = {
      title: `Test Opportunity ${id}`,
      description: `Test Description ${id}`,
      ministry: 'Test Ministry',
      location: 'Test Location',
      requirements: JSON.stringify(['Background check', 'Test requirement']),
      timeCommitment: '2 hours per week',
      status: 'ACTIVE',
    };

    // Merge overrides with base data
    const data = { ...baseData, ...overrides };

    // Handle null requirements properly
    if (overrides?.requirements === null) {
      data.requirements = null;
    }

    return prisma.opportunity.create({
      data: {
        ...data,
        leader: {
          connect: { id: leaderId },
        },
      },
    });
  }

  static async createVolunteerProfile(userId: string, overrides?: any) {
    const id = this.getNextId();
    return prisma.volunteerProfile.create({
      data: {
        userId,
        bio: `Test bio ${id}`,
        spiritualGifts: JSON.stringify(['Teaching', 'Service']),
        interests: JSON.stringify(['Children', 'Youth']),
        availability: JSON.stringify({
          weekdays: ['Evenings'],
          weekends: ['Saturday'],
        }),
        skills: JSON.stringify(['Mentoring', 'Teaching']),
        ...overrides,
      },
    });
  }

  static async createApplication(
    opportunityId: string,
    volunteerId: string,
    overrides?: any
  ) {
    const id = this.getNextId();
    return prisma.application.create({
      data: {
        opportunityId,
        volunteerId,
        status: 'PENDING',
        message: `Test application message ${id}`,
        ...overrides,
      },
    });
  }

  static async createCompleteScenario(
    overrides?: Partial<TestScenario>
  ): Promise<TestScenario> {
    const leader = await this.createLeader(overrides?.leader);
    const volunteer = await this.createUser(overrides?.volunteer);
    const opportunity = await this.createOpportunity(
      leader.id,
      overrides?.opportunity
    );
    const profile = await this.createVolunteerProfile(
      volunteer.id,
      overrides?.profile
    );

    const scenario: TestScenario = {
      leader,
      volunteer,
      opportunity,
      profile,
    };

    if (overrides?.application) {
      scenario.application = await this.createApplication(
        opportunity.id,
        volunteer.id,
        overrides.application
      );
    }

    return scenario;
  }

  static async cleanupScenario(scenario: TestScenario) {
    // Clean up in correct order to respect foreign key constraints
    if (scenario.application) {
      await prisma.application
        .delete({
          where: { id: scenario.application.id },
        })
        .catch(() => {}); // Ignore if already deleted
    }

    if (scenario.profile) {
      await prisma.volunteerProfile
        .delete({
          where: { id: scenario.profile.id },
        })
        .catch(() => {});
    }

    if (scenario.opportunity) {
      await prisma.opportunity
        .delete({
          where: { id: scenario.opportunity.id },
        })
        .catch(() => {});
    }

    // Clean up users
    await prisma.user
      .deleteMany({
        where: {
          id: { in: [scenario.leader.id, scenario.volunteer.id] },
        },
      })
      .catch(() => {});
  }

  static async cleanupAll() {
    // Clean up all test data in correct order
    await prisma.application.deleteMany();
    await prisma.volunteerProfile.deleteMany();
    await prisma.opportunity.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: { startsWith: 'test-' },
      },
    });
  }
}
