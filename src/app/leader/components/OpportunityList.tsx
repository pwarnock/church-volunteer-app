/**
 * Opportunity List Component
 *
 * Domain: Leader dashboard UI
 * Responsibility: Display list of opportunities with actions
 * Boundaries: Display only, no data fetching
 */

'use client';

import { Opportunity } from '../types/leader.types';

interface OpportunityListProps {
  opportunities: Opportunity[];
  loading?: boolean;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>;
  onToggleApplications?: () => void;
}

export default function OpportunityList({
  opportunities,
  loading = false,
  onEdit,
  onDelete,
  onToggleApplications,
}: OpportunityListProps) {
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    if (onDelete) {
      const result = await onDelete(id);
      if (!result.success) {
        alert(result.error || 'Failed to delete opportunity');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
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

  if (opportunities.length === 0) {
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No opportunities yet
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first volunteer opportunity.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Opportunities ({opportunities.length})
          </h2>
          {onToggleApplications && (
            <button
              onClick={onToggleApplications}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Applications
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {opportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {opportunity.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}
                  >
                    {opportunity.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-3 line-clamp-2">
                  {opportunity.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Ministry:</span>
                    <span className="ml-2 text-gray-600">
                      {opportunity.ministry}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-600">
                      {opportunity.location}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <span className="ml-2 text-gray-600">
                      {opportunity.timeCommitment}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Applications:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {opportunity._count.applications}
                    </span>
                  </div>
                </div>

                {opportunity.requirements &&
                  opportunity.requirements.length > 0 && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-700 text-sm">
                        Requirements:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {opportunity.requirements.map((req, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {(opportunity.startDate || opportunity.endDate) && (
                  <div className="mt-3 text-sm text-gray-600">
                    {opportunity.startDate && (
                      <span>
                        Starts:{' '}
                        {new Date(opportunity.startDate).toLocaleDateString()}
                      </span>
                    )}
                    {opportunity.startDate && opportunity.endDate && (
                      <span className="mx-2">•</span>
                    )}
                    {opportunity.endDate && (
                      <span>
                        Ends:{' '}
                        {new Date(opportunity.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="ml-4 flex flex-col space-y-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(opportunity)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() =>
                      handleDelete(opportunity.id, opportunity.title)
                    }
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
