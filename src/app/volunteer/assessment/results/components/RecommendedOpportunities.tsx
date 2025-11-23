/**
 * Recommended Opportunities Component
 *
 * Domain: Volunteer assessment results UI
 * Responsibility: Display next steps and recommended actions
 * Boundaries: Display only, no data fetching
 */

'use client';

import Link from 'next/link';
import { AssessmentResults } from '../types/assessment.types';

interface RecommendedOpportunitiesProps {
  results: AssessmentResults;
}

export default function RecommendedOpportunities({
  results,
}: RecommendedOpportunitiesProps) {
  const handleShareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Spiritual Gifts Results',
        text: `I discovered my top spiritual gifts: ${results?.topGifts.join(', ')}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Results link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Next Steps</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Apply to Serve</h3>
          <p className="text-gray-600 text-sm mb-4">
            Start using your gifts in ministry right away.
          </p>
          <Link
            href="/volunteer/opportunities"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Opportunities
          </Link>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Complete Profile</h3>
          <p className="text-gray-600 text-sm mb-4">
            Add more details to help ministries find you.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Update Profile
          </Link>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Share Results</h3>
          <p className="text-gray-600 text-sm mb-4">
            Discuss your gifts with ministry leaders.
          </p>
          <button
            onClick={handleShareResults}
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Share Results
          </button>
        </div>
      </div>
    </div>
  );
}
