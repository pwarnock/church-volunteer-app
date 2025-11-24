'use client';

interface LoadingStateProps {
  itemCount?: number;
}

export default function LoadingState({ itemCount = 3 }: LoadingStateProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="animate-pulse space-y-4">
        {[...Array(itemCount)].map((_, i) => (
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
