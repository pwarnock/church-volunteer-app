/**
 * Results Display Component
 *
 * Domain: Volunteer assessment results UI
 * Responsibility: Display top spiritual gifts overview
 * Boundaries: Display only, no data fetching
 */

'use client';

import { GiftResult } from '../types/assessment.types';
import { getSpiritualGift } from '@/data/spiritualGifts';

interface ResultsDisplayProps {
  giftResults: GiftResult[];
}

export default function ResultsDisplay({ giftResults }: ResultsDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Your Top Spiritual Gifts
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {giftResults.map((giftResult) => {
          const gift = getSpiritualGift(giftResult.name);

          return (
            <div key={giftResult.name} className="text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    #{giftResult.rank}
                  </span>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {giftResult.percentage}%
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {giftResult.name}
              </h3>
              <p className="text-gray-600 text-sm">{gift?.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
