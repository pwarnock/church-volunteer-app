'use client';

import { Opportunity } from '../../types/leader.types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (id: string, title: string) => Promise<void>;
  onViewApplications?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  default: 'bg-blue-100 text-blue-800',
};

export default function OpportunityCard({
  opportunity,
  onEdit,
  onDelete,
  onViewApplications,
}: OpportunityCardProps) {
  const statusColor =
    STATUS_COLORS[opportunity.status] || STATUS_COLORS.default;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{opportunity.title}</h3>
          <p className="text-sm text-gray-500">{opportunity.ministry}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
          {opportunity.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>

      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <p>
          <strong>Location:</strong> {opportunity.location}
        </p>
        <p>
          <strong>Time Commitment:</strong> {opportunity.timeCommitment}
        </p>
        {opportunity._count?.applications !== undefined && (
          <p>
            <strong>Applications:</strong> {opportunity._count.applications}
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {onViewApplications && (
          <button
            onClick={onViewApplications}
            className="text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded hover:bg-blue-50"
          >
            View Applications
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(opportunity)}
            className="text-sm text-gray-600 hover:text-gray-700 px-3 py-2 rounded hover:bg-gray-100"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(opportunity.id, opportunity.title)}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
