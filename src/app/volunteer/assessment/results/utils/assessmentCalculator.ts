/**
 * Assessment Calculator Utility
 *
 * Domain: Volunteer assessment calculations
 * Responsibility: Calculate spiritual gifts results from assessment data
 * Boundaries: Pure calculation functions, no UI or API calls
 */

import { AssessmentResults, GiftResult } from '../types/assessment.types';

export function calculateGiftResults(gifts: string[]): GiftResult[] {
  // Calculate gift counts from assessment logic
  const giftCounts: { [key: string]: number } = {};
  gifts.forEach((gift: string) => {
    giftCounts[gift] = (giftCounts[gift] || 0) + 1;
  });

  const totalQuestions = 5; // Assuming 5 questions per gift

  return gifts.map((giftName, index) => ({
    name: giftName,
    percentage: Math.round(
      ((giftCounts[giftName] || 0) / totalQuestions) * 100
    ),
    rank: index + 1,
  }));
}

export function formatAssessmentResults(gifts: string[]): AssessmentResults {
  const giftCounts: { [key: string]: number } = {};
  gifts.forEach((gift: string) => {
    giftCounts[gift] = (giftCounts[gift] || 0) + 1;
  });

  return {
    topGifts: gifts,
    giftCounts,
    totalQuestions: 5,
  };
}

export function getGiftPercentage(
  giftName: string,
  results: AssessmentResults
): number {
  if (!results) return 0;
  const count = results.giftCounts[giftName] || 0;
  return Math.round((count / results.totalQuestions) * 100);
}
