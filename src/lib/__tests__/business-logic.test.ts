/**
 * Focused High-Impact Tests
 *
 * Domain: Core business logic testing
 * Responsibility: Test most critical code paths
 * Boundaries: Simple, testable functions
 */

import { describe, it, expect } from 'vitest';

// Test core business logic functions
function calculateApplicationMetrics(applications: any[]) {
  const total = applications.length;
  const pending = applications.filter(app => app.status === 'PENDING').length;
  const approved = applications.filter(app => app.status === 'APPROVED').length;
  const rejected = applications.filter(app => app.status === 'REJECTED').length;

  return {
    total,
    pending,
    approved,
    rejected,
    pendingRate: total > 0 ? (pending / total) * 100 : 0,
    approvalRate: total > 0 ? (approved / total) * 100 : 0,
    rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
  };
}

function validateOpportunityData(data: any) {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.ministry || data.ministry.trim().length === 0) {
    errors.push('Ministry is required');
  }
  
  if (!data.timeCommitment || data.timeCommitment.trim().length === 0) {
    errors.push('Time commitment is required');
  }
  
  if (data.ministry && !['Children', 'Youth', 'Worship', 'Outreach', 'Administration'].includes(data.ministry)) {
    errors.push('Invalid ministry');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

function formatVolunteerProfile(profile: any) {
  const {
    id,
    userId,
    bio,
    spiritualGifts = '[]',
    interests = '[]',
    skills = '[]',
    availability = '{}',
    createdAt,
    updatedAt,
  } = profile;

  try {
    return {
      id,
      userId,
      bio: bio || '',
      spiritualGifts: JSON.parse(spiritualGifts),
      interests: JSON.parse(interests),
      skills: JSON.parse(skills),
      availability: JSON.parse(availability),
      createdAt: createdAt ? new Date(createdAt) : null,
      updatedAt: updatedAt ? new Date(updatedAt) : null,
    };
  } catch (error) {
    throw new Error('Invalid profile data format');
  }
}

function searchOpportunities(opportunities: any[], searchTerm: string) {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return opportunities;
  }

  const term = searchTerm.toLowerCase();
  return opportunities.filter(opp => 
    opp.title.toLowerCase().includes(term) ||
    opp.ministry.toLowerCase().includes(term) ||
    opp.description.toLowerCase().includes(term) ||
    opp.location.toLowerCase().includes(term)
  );
}

describe('High-Impact Business Logic', () => {
  describe('calculateApplicationMetrics', () => {
    it('should calculate metrics correctly', () => {
      const applications = [
        { status: 'PENDING' },
        { status: 'PENDING' },
        { status: 'APPROVED' },
        { status: 'APPROVED' },
        { status: 'REJECTED' },
      ];

      const metrics = calculateApplicationMetrics(applications);

      expect(metrics.total).toBe(5);
      expect(metrics.pending).toBe(2);
      expect(metrics.approved).toBe(2);
      expect(metrics.rejected).toBe(1);
      expect(metrics.pendingRate).toBe(40);
      expect(metrics.approvalRate).toBe(40);
      expect(metrics.rejectionRate).toBe(20);
    });

    it('should handle empty array', () => {
      const metrics = calculateApplicationMetrics([]);

      expect(metrics.total).toBe(0);
      expect(metrics.pending).toBe(0);
      expect(metrics.approved).toBe(0);
      expect(metrics.rejected).toBe(0);
      expect(metrics.pendingRate).toBe(0);
      expect(metrics.approvalRate).toBe(0);
      expect(metrics.rejectionRate).toBe(0);
    });

    it('should calculate 100% approval rate', () => {
      const applications = [
        { status: 'APPROVED' },
        { status: 'APPROVED' },
        { status: 'APPROVED' },
      ];

      const metrics = calculateApplicationMetrics(applications);

      expect(metrics.approvalRate).toBe(100);
      expect(metrics.pendingRate).toBe(0);
      expect(metrics.rejectionRate).toBe(0);
    });
  });

  describe('validateOpportunityData', () => {
    it('should validate complete opportunity data', () => {
      const data = {
        title: 'Youth Leader',
        ministry: 'Youth',
        description: 'Help lead youth group',
        timeCommitment: '3 hours/week',
        location: 'Church',
      };

      const result = validateOpportunityData(data);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing title', () => {
      const data = {
        ministry: 'Youth',
        timeCommitment: '3 hours/week',
      };

      const result = validateOpportunityData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject invalid ministry', () => {
      const data = {
        title: 'Test',
        ministry: 'Invalid Ministry',
        timeCommitment: '3 hours/week',
      };

      const result = validateOpportunityData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid ministry');
    });

    it('should accumulate multiple errors', () => {
      const data = {
        title: '',
        ministry: 'Invalid',
        timeCommitment: '',
      };

      const result = validateOpportunityData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('formatVolunteerProfile', () => {
    it('should format profile with JSON strings', () => {
      const profile = {
        id: '1',
        userId: 'user1',
        bio: 'Test bio',
        spiritualGifts: '["Teaching", "Leadership"]',
        interests: '["Youth", "Children"]',
        skills: '["Teaching"]',
        availability: '{"monday": "evening", "weekend": "available"}',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      const formatted = formatVolunteerProfile(profile);

      expect(formatted.spiritualGifts).toEqual(['Teaching', 'Leadership']);
      expect(formatted.interests).toEqual(['Youth', 'Children']);
      expect(formatted.skills).toEqual(['Teaching']);
      expect(formatted.availability.monday).toBe('evening');
      expect(formatted.bio).toBe('Test bio');
    });

    it('should handle missing optional fields', () => {
      const profile = {
        id: '1',
        userId: 'user1',
        bio: '',
        spiritualGifts: '[]',
        interests: '[]',
        skills: '[]',
        availability: '{}',
      };

      const formatted = formatVolunteerProfile(profile);

      expect(formatted.spiritualGifts).toEqual([]);
      expect(formatted.interests).toEqual([]);
      expect(formatted.skills).toEqual([]);
      expect(formatted.availability).toEqual({});
      expect(formatted.bio).toBe('');
      expect(formatted.createdAt).toBeNull();
    });

    it('should throw error for invalid JSON', () => {
      const profile = {
        id: '1',
        userId: 'user1',
        spiritualGifts: 'invalid json',
        interests: '[]',
        skills: '[]',
        availability: '{}',
      };

      expect(() => formatVolunteerProfile(profile)).toThrow('Invalid profile data format');
    });
  });

  describe('searchOpportunities', () => {
    const opportunities = [
      {
        title: 'Youth Ministry Leader',
        ministry: 'Youth',
        description: 'Lead youth group activities',
        location: 'Church Building',
      },
      {
        title: 'Children Sunday School Teacher',
        ministry: 'Children',
        description: 'Teach Sunday school',
        location: 'Classroom 1',
      },
      {
        title: 'Worship Team Member',
        ministry: 'Worship',
        description: 'Join worship team',
        location: 'Sanctuary',
      },
    ];

    it('should search by title', () => {
      const results = searchOpportunities(opportunities, 'Youth');

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Youth Ministry Leader');
    });

    it('should search by ministry', () => {
      const results = searchOpportunities(opportunities, 'Children');

      expect(results).toHaveLength(1);
      expect(results[0].ministry).toBe('Children');
    });

    it('should search by description', () => {
      const results = searchOpportunities(opportunities, 'Teach');

      expect(results).toHaveLength(1);
      expect(results[0].description).toContain('Teach');
    });

    it('should search by location', () => {
      const results = searchOpportunities(opportunities, 'Sanctuary');

      expect(results).toHaveLength(1);
      expect(results[0].location).toBe('Sanctuary');
    });

    it('should be case insensitive', () => {
      const results = searchOpportunities(opportunities, 'youth');

      expect(results).toHaveLength(1);
      expect(results[0].ministry).toBe('Youth');
    });

    it('should return all for empty search', () => {
      const results = searchOpportunities(opportunities, '');

      expect(results).toHaveLength(3);
    });

    it('should return empty for no matches', () => {
      const results = searchOpportunities(opportunities, 'Nonexistent');

      expect(results).toHaveLength(0);
    });

    it('should return multiple matches', () => {
      const opportunitiesWithMultiple = [
        ...opportunities,
        {
          title: 'Youth Worship Leader',
          ministry: 'Youth',
          description: 'Lead youth worship',
          location: 'Sanctuary',
        },
      ];

      const results = searchOpportunities(opportunitiesWithMultiple, 'Youth');

      expect(results).toHaveLength(2);
      expect(results.every(r => r.title.includes('Youth') || r.ministry === 'Youth')).toBe(true);
    });
  });
});