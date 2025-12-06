import { describe, it, expect } from 'vitest';

// Test opportunity validation logic
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

  if (
    data.ministry &&
    !['Children', 'Youth', 'Worship', 'Outreach', 'Administration'].includes(
      data.ministry
    )
  ) {
    errors.push('Invalid ministry');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

describe('Opportunity Validation', () => {
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

  it('should reject missing ministry', () => {
    const data = {
      title: 'Test',
      timeCommitment: '3 hours/week',
    };

    const result = validateOpportunityData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Ministry is required');
  });

  it('should reject missing time commitment', () => {
    const data = {
      title: 'Test',
      ministry: 'Youth',
    };

    const result = validateOpportunityData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Time commitment is required');
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

  it('should accept valid ministries', () => {
    const validMinistries = [
      'Children',
      'Youth',
      'Worship',
      'Outreach',
      'Administration',
    ];

    validMinistries.forEach((ministry) => {
      const data = {
        title: 'Test',
        ministry,
        timeCommitment: '3 hours/week',
      };

      const result = validateOpportunityData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('should handle empty strings', () => {
    const data = {
      title: '   ',
      ministry: 'Youth',
      timeCommitment: '3 hours/week',
    };

    const result = validateOpportunityData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
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

  it('should trim whitespace before validation', () => {
    const data = {
      title: ' Test Title ',
      ministry: ' Youth ',
      timeCommitment: ' 3 hours/week ',
    };

    const result = validateOpportunityData(data);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate ministry case-sensitively', () => {
    const data = {
      title: 'Test',
      ministry: 'youth', // lowercase, should be invalid
      timeCommitment: '3 hours/week',
    };

    const result = validateOpportunityData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid ministry');
  });

  it('should handle null values', () => {
    const data = {
      title: null,
      ministry: null,
      timeCommitment: null,
    };

    const result = validateOpportunityData(data);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
    expect(result.errors).toContain('Ministry is required');
    expect(result.errors).toContain('Time commitment is required');
  });

  it('should validate title length', () => {
    const data = {
      title: 'Test', // Should be valid even if short
      ministry: 'Youth',
      timeCommitment: '3 hours/week',
    };

    const result = validateOpportunityData(data);
    expect(result.isValid).toBe(true);
  });
});
