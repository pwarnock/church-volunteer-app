'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VolunteerPage() {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Volunteer Portal
          </h1>
          <p className="text-xl text-gray-600">
            Discover your spiritual gifts and find meaningful ways to serve
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/volunteer/assessment" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Spiritual Gifts Assessment
                </h2>
                <p className="text-gray-600 mb-4">
                  Take our interactive assessment to discover your unique
                  spiritual gifts and calling.
                </p>
                <div className="text-blue-600 font-semibold group-hover:text-blue-700">
                  Start Assessment →
                </div>
              </div>
            </div>
          </Link>

          <Link href="/volunteer/assessment/results" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  View My Results
                </h2>
                <p className="text-gray-600 mb-4">
                  Review your spiritual gifts assessment results and find
                  matching opportunities.
                </p>
                <div className="text-purple-600 font-semibold group-hover:text-purple-700">
                  View Results →
                </div>
              </div>
            </div>
          </Link>

          <Link href="/volunteer/opportunities" className="group">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Browse Opportunities
                </h2>
                <p className="text-gray-600 mb-4">
                  Explore available volunteer opportunities across different
                  ministries.
                </p>
                <div className="text-green-600 font-semibold group-hover:text-green-700">
                  View Opportunities →
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/auth/signin"
            className="text-gray-600 hover:text-gray-900 underline mr-4"
          >
            Already have an account? Sign in
          </Link>
          {session && (
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
          )}
        </div>
      </div>
    </div>
  );
}
