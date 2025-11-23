/**
 * Spiritual Gifts Data Index
 *
 * Domain: Spiritual gifts assessment data
 * Responsibility: Main exports and data aggregation for spiritual gifts
 * Boundaries: Data aggregation only, no business logic
 */

import { SpiritualGift } from './definitions';
import { spiritualGiftsDefinitions } from './definitions';
import { spiritualGiftsScriptures } from './scriptures';
import { spiritualGiftsApplications } from './applications';

/**
 * Complete spiritual gifts data combining definitions, scriptures, and applications
 */
export const spiritualGiftsData: Record<string, SpiritualGift> = {};

// Combine all data sources
Object.keys(spiritualGiftsDefinitions).forEach((giftName) => {
  const definition = spiritualGiftsDefinitions[giftName];
  const scriptures = spiritualGiftsScriptures[giftName] || [];
  const applications = spiritualGiftsApplications[giftName] || {
    practicalApplications: [],
    matchingMinistries: [],
  };

  spiritualGiftsData[giftName] = {
    ...definition,
    keyScriptures: scriptures,
    practicalApplications: applications.practicalApplications,
    matchingMinistries: applications.matchingMinistries,
  };
});

/**
 * Get a specific spiritual gift by name
 */
export function getSpiritualGift(giftName: string): SpiritualGift | undefined {
  return spiritualGiftsData[giftName];
}

/**
 * Get all spiritual gifts
 */
export function getAllSpiritualGifts(): SpiritualGift[] {
  return Object.values(spiritualGiftsData);
}

/**
 * Get spiritual gifts by matching ministry
 */
export function getGiftsByMinistry(ministry: string): SpiritualGift[] {
  return getAllSpiritualGifts().filter((gift) =>
    gift.matchingMinistries.includes(ministry)
  );
}

/**
 * Search spiritual gifts by keyword in description or applications
 */
export function searchSpiritualGifts(keyword: string): SpiritualGift[] {
  const lowerKeyword = keyword.toLowerCase();
  return getAllSpiritualGifts().filter(
    (gift) =>
      gift.name.toLowerCase().includes(lowerKeyword) ||
      gift.description.toLowerCase().includes(lowerKeyword) ||
      gift.practicalApplications.some((app) =>
        app.toLowerCase().includes(lowerKeyword)
      )
  );
}

/**
 * Get gifts with practical applications count
 */
export function getGiftsByApplicationCount(): Array<{
  gift: SpiritualGift;
  applicationCount: number;
}> {
  return getAllSpiritualGifts()
    .map((gift) => ({
      gift,
      applicationCount: gift.practicalApplications.length,
    }))
    .sort((a, b) => b.applicationCount - a.applicationCount);
}

// Re-export types and individual data modules
export type { SpiritualGift } from './definitions';
export { spiritualGiftsDefinitions } from './definitions';
export { spiritualGiftsScriptures } from './scriptures';
export { spiritualGiftsApplications } from './applications';
