/**
 * Application List Component
 *
 * Domain: Leader dashboard UI
 * Responsibility: Display and manage volunteer applications
 * Boundaries: Display only, no data fetching
 */

'use client';

import { Application } from '../types/leader.types';

interface ApplicationListProps {
  applications: Application[];
  loading?: boolean;
  onUpdateStatus?: (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ) => Promise<{ success: boolean; error?: string }>;
  onBack?: () => void;
}

export default function ApplicationList({
  applications,
  loading = false,
  onUpdateStatus,
  onBack,
}: ApplicationListProps) {
  const handleStatusUpdate = async (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    if (!onUpdateStatus) return;

    const confirmMessage =
      status === 'APPROVED'
        ? 'Approve this application?'
        : 'Reject this application?';

    if (!confirm(confirmMessage)) {
      return;
    }

    const result = await onUpdateStatus(id, status);
    if (!result.success) {
      alert(result.error || 'Failed to update application status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
        <p className="text-gray-500 mb-4">
          Volunteers haven't applied to any opportunities yet.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Opportunities
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Applications ({applications.length})
          </h2>
          {onBack && (
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to Opportunities
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {applications.map((application) => (
          <div key={application.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {application.volunteer.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {application.volunteer.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(application.createdAt)}
                </p>
                <div className="space-x-2">
                  {onUpdateStatus && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.id, 'APPROVED')
                        }
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(application.id, 'REJECTED')
                        }
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Applied for: {application.opportunity.title}
              </h4>

              {application.message && (
                <div className="mb-3">
                  <h5 className="font-medium text-gray-700 mb-1">Message:</h5>
                  <p className="text-gray-600 italic">
                    "{application.message}"
                  </p>
                </div>
              )}

              {application.volunteer.profile?.spiritualGifts && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-1">
                    Spiritual Gifts:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(
                      application.volunteer.profile.spiritualGifts
                    ).map((gift: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-700"
                      >
                        {gift}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p>
                Review this application carefully. Consider the volunteer's
                spiritual gifts, message, and how they align with the
                opportunity requirements.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
