/**
 * Opportunity Matcher Utility
 *
 * Domain: Volunteer opportunity matching
 * Responsibility: Match opportunities to spiritual gifts
 * Boundaries: Pure matching functions, no UI or API calls
 */

import { Opportunity, MatchingOpportunity } from '../types/assessment.types';
import { getSpiritualGift } from '@/data/spiritualGifts';

export function findMatchingOpportunities(
  giftName: string,
  opportunities: Opportunity[],
  limit: number = 3
): MatchingOpportunity[] {
  const gift = getSpiritualGift(giftName);
  if (!gift) return [];

  const matched = opportunities
    .filter((opp) =>
      gift.matchingMinistries.some((ministry) =>
        opp.ministry.toLowerCase().includes(ministry.toLowerCase())
      )
    )
    .map((opp) => ({
      ...opp,
      matchScore: calculateMatchScore(giftName, opp),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return matched;
}

export function calculateMatchScore(
  giftName: string,
  opportunity: Opportunity
): number {
  const gift = getSpiritualGift(giftName);
  if (!gift) return 0;

  let score = 0;

  // Check ministry match
  const ministryMatch = gift.matchingMinistries.some((ministry) =>
    opportunity.ministry.toLowerCase().includes(ministry.toLowerCase())
  );
  if (ministryMatch) score += 50;

  // Check if gift is in required gifts
  if (opportunity.requiredGifts?.includes(giftName)) {
    score += 30;
  }

  // Check description keywords
  const keywords = gift.practicalApplications.join(' ').toLowerCase();
  const descriptionWords = opportunity.description.toLowerCase();
  const keywordMatches = keywords
    .split(' ')
    .filter(
      (word) => word.length > 3 && descriptionWords.includes(word)
    ).length;
  score += Math.min(keywordMatches * 5, 20);

  return Math.min(score, 100);
}

export function getAllMatchingOpportunities(
  topGifts: string[],
  opportunities: Opportunity[]
): { [giftName: string]: MatchingOpportunity[] } {
  const matches: { [giftName: string]: MatchingOpportunity[] } = {};

  topGifts.forEach((gift) => {
    matches[gift] = findMatchingOpportunities(gift, opportunities);
  });

  return matches;
}
