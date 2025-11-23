'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  opportunity: {
    id: string;
    title: string;
    ministry: string;
  };
  volunteer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profile?: {
      spiritualGifts?: string[];
      interests?: string[];
      availability?: string;
    };
  };
  message?: string;
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (
      session.user.role !== 'MINISTRY_LEADER' &&
      session.user.role !== 'ADMIN'
    ) {
      router.push('/dashboard');
      return;
    }

    fetchApplications();
  }, [session, router]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load applications'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      // Refresh applications list
      fetchApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update application'
      );
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to continue
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

  if (
    session.user.role !== 'MINISTRY_LEADER' &&
    session.user.role !== 'ADMIN'
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to view this page.
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Volunteer Applications
              </h1>
              <p className="mt-2 text-gray-600">
                Review and manage applications for your ministry opportunities
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Dashboard
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
                Sign out
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-4">
              Volunteers haven&apos;t applied to any opportunities yet.
            </p>
            <Link
              href="/leader"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Manage Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {application.opportunity.ministry}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.status === 'ACCEPTED'
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Volunteer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-600">
                          {application.volunteer.name}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Email:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {application.volunteer.email}
                        </span>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700">
                          Applied:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {application.volunteer.profile && (
                      <div className="mt-4 space-y-2">
                        {application.volunteer.profile.spiritualGifts && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Spiritual Gifts:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(() => {
                                try {
                                  const gifts =
                                    typeof application.volunteer.profile
                                      .spiritualGifts === 'string'
                                      ? JSON.parse(
                                          application.volunteer.profile
                                            .spiritualGifts
                                        )
                                      : application.volunteer.profile
                                          .spiritualGifts;
                                  return Array.isArray(gifts)
                                    ? gifts.map((gift, index) => (
                                        <span
                                          key={index}
                                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                        >
                                          {gift}
                                        </span>
                                      ))
                                    : null;
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                        {application.volunteer.profile.interests && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Interests:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(() => {
                                try {
                                  const interests =
                                    typeof application.volunteer.profile
                                      .interests === 'string'
                                      ? JSON.parse(
                                          application.volunteer.profile
                                            .interests
                                        )
                                      : application.volunteer.profile.interests;
                                  return Array.isArray(interests)
                                    ? interests.map((interest, index) => (
                                        <span
                                          key={index}
                                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                        >
                                          {interest}
                                        </span>
                                      ))
                                    : null;
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        )}
                        {application.volunteer.profile.availability && (
                          <div>
                            <span className="font-medium text-gray-700">
                              Availability:
                            </span>
                            <span className="ml-2 text-gray-600">
                              {application.volunteer.profile.availability}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {application.message && (
                      <div className="mt-4">
                        <span className="font-medium text-gray-700">
                          Message:
                        </span>
                        <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded">
                          {application.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {application.status === 'PENDING' && (
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() =>
                          updateApplicationStatus(application.id, 'ACCEPTED')
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Accept Application
                      </button>
                      <button
                        onClick={() =>
                          updateApplicationStatus(application.id, 'REJECTED')
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
