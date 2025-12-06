import { describe, it, expect } from 'vitest';

// Test opportunity search functionality
function searchOpportunities(opportunities: any[], query: string) {
  if (!query || query.trim() === '') {
    return opportunities;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return opportunities.filter((opportunity) => {
    return (
      opportunity.title?.toLowerCase().includes(normalizedQuery) ||
      opportunity.ministry?.toLowerCase().includes(normalizedQuery) ||
      opportunity.description?.toLowerCase().includes(normalizedQuery) ||
      opportunity.location?.toLowerCase().includes(normalizedQuery)
    );
  });
}

describe('Opportunity Search Functionality', () => {
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

  it('should return all for whitespace search', () => {
    const results = searchOpportunities(opportunities, '   ');

    expect(results).toHaveLength(3);
  });

  it('should return empty for no matches', () => {
    const results = searchOpportunities(opportunities, 'Nonexistent');

    expect(results).toHaveLength(0);
  });

  it('should handle null query', () => {
    const results = searchOpportunities(opportunities, null as any);

    expect(results).toHaveLength(3);
  });

  it('should return multiple matches', () => {
    const opportunitiesWithMultiple = [
      {
        title: 'Youth Leader',
        ministry: 'Youth',
        description: 'Lead youth activities',
        location: 'Youth Room',
      },
      {
        title: 'Children Teacher',
        ministry: 'Children',
        description: 'Teach children about youth',
        location: 'Classroom',
      },
    ];

    const results = searchOpportunities(opportunitiesWithMultiple, 'Youth');

    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Youth Leader');
    expect(results[1].description).toContain('youth');
  });

  it('should handle partial matches', () => {
    const results = searchOpportunities(opportunities, 'teach');

    expect(results).toHaveLength(1);
    expect(results[0].description).toContain('Teach');
  });

  it('should handle missing fields gracefully', () => {
    const opportunitiesWithMissing = [
      { title: 'Test 1' }, // missing other fields
      { ministry: 'Test 2' }, // missing other fields
      { description: 'Test 3' }, // missing other fields
      { location: 'Test 4' }, // missing other fields
    ];

    const results1 = searchOpportunities(opportunitiesWithMissing, 'Test 1');
    expect(results1).toHaveLength(1);
    expect(results1[0].title).toBe('Test 1');

    const results2 = searchOpportunities(opportunitiesWithMissing, 'Test 2');
    expect(results2).toHaveLength(1);
    expect(results2[0].ministry).toBe('Test 2');

    const results3 = searchOpportunities(opportunitiesWithMissing, 'Test 3');
    expect(results3).toHaveLength(1);
    expect(results3[0].description).toBe('Test 3');

    const results4 = searchOpportunities(opportunitiesWithMissing, 'Test 4');
    expect(results4).toHaveLength(1);
    expect(results4[0].location).toBe('Test 4');
  });

  it('should trim whitespace from query', () => {
    const results = searchOpportunities(opportunities, '  Youth  ');

    expect(results).toHaveLength(1);
    expect(results[0].ministry).toBe('Youth');
  });

  it('should handle special characters', () => {
    const opportunitiesWithSpecial = [
      {
        title: 'Youth & Young Adults',
        ministry: 'Youth',
        description: 'Work with youth/young adults',
        location: 'Room 101',
      },
    ];

    const results = searchOpportunities(opportunitiesWithSpecial, '&');
    expect(results).toHaveLength(1);
  });

  it('should maintain original order of matches', () => {
    const results = searchOpportunities(opportunities, 'a');

    // Should return all opportunities in original order that contain 'a'
    expect(results.length).toBeGreaterThan(0);

    // Check that order is preserved
    const originalIndices = results.map((result) =>
      opportunities.findIndex((opp) => opp.title === result.title)
    );
    const isSorted = originalIndices.every(
      (val, i, arr) => i === 0 || arr[i - 1] <= val
    );
    expect(isSorted).toBe(true);
  });

  it('should handle numeric searches', () => {
    const opportunitiesWithNumbers = [
      { title: 'Room 101 Assistant', ministry: 'Children' },
      { title: 'Room 202 Helper', ministry: 'Youth' },
    ];

    const results = searchOpportunities(opportunitiesWithNumbers, '101');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Room 101 Assistant');
  });
});
