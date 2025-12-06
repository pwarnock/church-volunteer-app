import { describe, it, expect } from 'vitest';

// Test volunteer profile formatting logic
function formatVolunteerProfile(profile: any) {
  try {
    return {
      ...profile,
      spiritualGifts: profile.spiritualGifts
        ? JSON.parse(profile.spiritualGifts)
        : [],
      interests: profile.interests ? JSON.parse(profile.interests) : [],
      skills: profile.skills ? JSON.parse(profile.skills) : [],
      availability: profile.availability
        ? JSON.parse(profile.availability)
        : {},
      bio: profile.bio || '',
      createdAt: profile.createdAt ? new Date(profile.createdAt) : null,
      updatedAt: profile.updatedAt ? new Date(profile.updatedAt) : null,
    };
  } catch (error) {
    throw new Error('Invalid profile data format');
  }
}

describe('Volunteer Profile Formatting', () => {
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

    expect(() => formatVolunteerProfile(profile)).toThrow(
      'Invalid profile data format'
    );
  });

  it('should handle null JSON fields', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      bio: 'Test bio',
      spiritualGifts: null,
      interests: null,
      skills: null,
      availability: null,
    };

    const formatted = formatVolunteerProfile(profile);

    expect(formatted.spiritualGifts).toEqual([]);
    expect(formatted.interests).toEqual([]);
    expect(formatted.skills).toEqual([]);
    expect(formatted.availability).toEqual({});
  });

  it('should parse complex JSON structures', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      spiritualGifts: '["Teaching", "Leadership", "Pastoral Care"]',
      interests: '["Youth", "Children", "Outreach"]',
      skills: '["Teaching", "Music", "Organization"]',
      availability:
        '{"monday": ["morning", "evening"], "weekend": ["morning", "afternoon"]}',
    };

    const formatted = formatVolunteerProfile(profile);

    expect(formatted.spiritualGifts).toHaveLength(3);
    expect(formatted.interests).toHaveLength(3);
    expect(formatted.skills).toHaveLength(3);
    expect(formatted.availability.monday).toHaveLength(2);
    expect(formatted.availability.weekend).toHaveLength(2);
  });

  it('should handle empty string JSON', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      spiritualGifts: '',
      interests: '',
      skills: '',
      availability: '',
    };

    const formatted = formatVolunteerProfile(profile);

    expect(formatted.spiritualGifts).toEqual([]);
    expect(formatted.interests).toEqual([]);
    expect(formatted.skills).toEqual([]);
    expect(formatted.availability).toEqual({});
  });

  it('should preserve non-JSON fields', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Test bio',
      spiritualGifts: '["Teaching"]',
    };

    const formatted = formatVolunteerProfile(profile);

    expect(formatted.id).toBe('1');
    expect(formatted.userId).toBe('user1');
    expect(formatted.name).toBe('John Doe');
    expect(formatted.email).toBe('john@example.com');
    expect(formatted.spiritualGifts).toEqual(['Teaching']);
  });

  it('should parse date strings', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      spiritualGifts: '[]',
      interests: '[]',
      skills: '[]',
      availability: '{}',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T15:45:00Z',
    };

    const formatted = formatVolunteerProfile(profile);

    expect(formatted.createdAt).toBeInstanceOf(Date);
    expect(formatted.updatedAt).toBeInstanceOf(Date);
    expect(formatted.createdAt!.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    expect(formatted.updatedAt!.toISOString()).toBe('2024-01-20T15:45:00.000Z');
  });

  it('should handle malformed date strings', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      spiritualGifts: '[]',
      interests: '[]',
      skills: '[]',
      availability: '{}',
      createdAt: 'invalid-date',
      updatedAt: 'also-invalid',
    };

    // Should not throw, but might create invalid dates
    expect(() => formatVolunteerProfile(profile)).not.toThrow();

    const formatted = formatVolunteerProfile(profile);
    expect(formatted.createdAt).toBeInstanceOf(Date);
    expect(formatted.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle whitespace-only bio', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      bio: '   ',
      spiritualGifts: '[]',
      interests: '[]',
      skills: '[]',
      availability: '{}',
    };

    const formatted = formatVolunteerProfile(profile);
    expect(formatted.bio).toBe('   '); // Should preserve exact input
  });

  it('should handle nested JSON objects', () => {
    const profile = {
      id: '1',
      userId: 'user1',
      spiritualGifts: '[]',
      interests: '[]',
      skills: '[]',
      availability:
        '{"preferences": {"days": ["weekend"], "times": ["morning"]}, "exceptions": {"dates": ["2024-12-25"]}}',
    };

    const formatted = formatVolunteerProfile(profile);

    expect(formatted.availability.preferences.days).toEqual(['weekend']);
    expect(formatted.availability.preferences.times).toEqual(['morning']);
    expect(formatted.availability.exceptions.dates).toEqual(['2024-12-25']);
  });
});
