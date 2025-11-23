/**
 * Dashboard Stats Component
 *
 * Domain: Leader dashboard UI
 * Responsibility: Display dashboard statistics
 * Boundaries: Display only, no data fetching
 */

'use client';

import { LeaderDashboardStats } from '../types/leader.types';

interface DashboardStatsProps {
  stats: LeaderDashboardStats;
  loading?: boolean;
}

export default function DashboardStats({
  stats,
  loading = false,
}: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Opportunities',
      value: stats.totalOpportunities,
      icon: (
        <svg
          className="h-6 w-6 text-blue-600"
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
      ),
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Active Opportunities',
      value: stats.activeOpportunities,
      icon: (
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: (
        <svg
          className="h-6 w-6 text-purple-600"
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
      ),
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: (
        <svg
          className="h-6 w-6 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow p-6 border ${card.color}`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">{card.icon}</div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
