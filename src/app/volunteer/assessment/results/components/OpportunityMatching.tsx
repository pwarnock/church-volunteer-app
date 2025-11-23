/**
 * Opportunity Matching Component
 *
 * Domain: Volunteer assessment results UI
 * Responsibility: Display detailed gift information with matching opportunities
 * Boundaries: Display only, no data fetching
 */

'use client';

import Link from 'next/link';
import { MatchingOpportunity } from '../types/assessment.types';
import { getSpiritualGift } from '@/data/spiritualGifts';

interface OpportunityMatchingProps {
  giftName: string;
  matchingOpportunities: MatchingOpportunity[];
}

export default function OpportunityMatching({
  giftName,
  matchingOpportunities,
}: OpportunityMatchingProps) {
  const gift = getSpiritualGift(giftName);
  if (!gift) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gift Details */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {gift.name}
          </h3>
          <p className="text-gray-700 mb-6">{gift.description}</p>

          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Biblical Foundation
            </h4>
            <p className="text-gray-600 mb-3">{gift.biblicalFoundation}</p>
            <div className="space-y-2">
              {gift.keyScriptures.map((scripture, index) => (
                <p key={index} className="text-sm text-gray-600 italic">
                  {scripture}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Practical Applications
            </h4>
            <ul className="space-y-2">
              {gift.practicalApplications.map((application, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{application}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Matching Opportunities */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">
            Matching Opportunities
          </h4>
          {matchingOpportunities.length > 0 ? (
            <div className="space-y-3">
              {matchingOpportunities.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-gray-900">
                      {opportunity.title}
                    </h5>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {opportunity.ministry}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {opportunity.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {opportunity.timeCommitment}
                    </span>
                    <Link
                      href="/volunteer/opportunities"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">
                No matching opportunities available right now.
              </p>
              <Link
                href="/volunteer/opportunities"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Opportunities
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
