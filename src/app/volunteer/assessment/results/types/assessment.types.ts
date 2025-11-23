/**
 * Assessment Results Types
 *
 * Domain: Volunteer assessment results
 * Responsibility: TypeScript interfaces for assessment functionality
 * Boundaries: Type definitions only, no implementation
 */

export interface AssessmentResults {
  topGifts: string[];
  giftCounts: { [key: string]: number };
  totalQuestions: number;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  requiredGifts: string[];
  ministry: string;
  timeCommitment: string;
}

export interface GiftResult {
  name: string;
  percentage: number;
  rank: number;
  description?: string;
}

export interface MatchingOpportunity {
  id: string;
  title: string;
  description: string;
  ministry: string;
  timeCommitment: string;
  matchScore: number;
}
