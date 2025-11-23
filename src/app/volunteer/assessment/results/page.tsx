'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import type {
  AssessmentResults,
  Opportunity,
  GiftResult,
  MatchingOpportunity,
} from './types/assessment.types';
import {
  calculateGiftResults,
  formatAssessmentResults,
} from './utils/assessmentCalculator';
import { findMatchingOpportunities } from './utils/opportunityMatcher';

import ResultsDisplay from './components/ResultsDisplay';
import OpportunityMatching from './components/OpportunityMatching';
import RecommendedOpportunities from './components/RecommendedOpportunities';

export default function AssessmentResults() {
  const { data: session } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);

  const [giftResults, setGiftResults] = useState<GiftResult[]>([]);
  const [matchingOpportunities, setMatchingOpportunities] = useState<{
    [giftName: string]: MatchingOpportunity[];
  }>({});

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Get user profile with assessment results
      const profileResponse = await fetch('/api/volunteer/profile');
      const profileData = await profileResponse.json();

      if (profileData.profile?.spiritualGifts) {
        const gifts = JSON.parse(profileData.profile.spiritualGifts);
        const assessmentResults = formatAssessmentResults(gifts);
        const calculatedGiftResults = calculateGiftResults(gifts);

        setResults(assessmentResults);
        setGiftResults(calculatedGiftResults);

        // Fetch matching opportunities
        await fetchMatchingOpportunities(gifts);
      } else {
        // No assessment results found, redirect to assessment
        router.push('/volunteer/assessment');
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      router.push('/volunteer/assessment');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingOpportunities = async (gifts: string[]) => {
    try {
      const response = await fetch('/api/opportunities');
      const data = await response.json();
      const opportunitiesData = data.opportunities || [];

      // Calculate matching opportunities for each gift
      const matches: { [giftName: string]: MatchingOpportunity[] } = {};
      gifts.forEach((gift) => {
        matches[gift] = findMatchingOpportunities(gift, opportunitiesData);
      });
      setMatchingOpportunities(matches);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view your results
          </h2>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading your spiritual gifts results...
          </p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Assessment Results Found
          </h2>
          <p className="text-gray-600 mb-6">
            Please complete the spiritual gifts assessment to see your results.
          </p>
          <Link
            href="/volunteer/assessment"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Take Assessment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Spiritual Gifts Results
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            God has uniquely gifted you for ministry. Here are your top
            spiritual gifts and how you can use them to serve others.
          </p>
        </div>

        {/* Top Gifts Overview */}
        <ResultsDisplay giftResults={giftResults} />

        {/* Detailed Gift Information with Matching Opportunities */}
        <div className="space-y-8 mb-8">
          {results.topGifts.map((giftName) => (
            <OpportunityMatching
              key={giftName}
              giftName={giftName}
              matchingOpportunities={matchingOpportunities[giftName] || []}
            />
          ))}
        </div>

        {/* Next Steps */}
        <RecommendedOpportunities results={results} />

        {/* Retake Assessment */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Feel these results don&apos;t reflect your calling? You can retake
            the assessment.
          </p>
          <Link
            href="/volunteer/assessment"
            className="text-blue-600 hover:text-blue-800 underline mr-4"
          >
            Retake Assessment
          </Link>
          <button
            onClick={async () => {
              try {
                await signOut({ redirect: false });
                router.push('/');
              } catch (error) {
                console.error('Sign out error:', error);
              }
            }}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
