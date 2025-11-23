'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useOpportunities } from './hooks/useOpportunities';
import { useApplications } from './hooks/useApplications';
import {
  LeaderDashboardStats,
  OpportunityFormData,
} from './types/leader.types';

import OpportunityForm from './components/OpportunityForm';
import OpportunityList from './components/OpportunityList';
import ApplicationList from './components/ApplicationList';
import DashboardStats from './components/DashboardStats';

export default function LeaderDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApplications, setShowApplications] = useState(false);

  const {
    opportunities,
    loading: opportunitiesLoading,
    error: opportunitiesError,
    createOpportunity,
    deleteOpportunity,
  } = useOpportunities();

  const {
    applications,
    loading: applicationsLoading,
    updateApplicationStatus,
  } = useApplications();

  const calculateStats = (): LeaderDashboardStats => {
    return {
      totalOpportunities: opportunities.length,
      activeOpportunities: opportunities.filter(
        (opp) => opp.status === 'ACTIVE'
      ).length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(
        (app) => !app.status || app.status === 'PENDING'
      ).length,
    };
  };

  const handleCreateOpportunity = async (formData: OpportunityFormData) => {
    const submissionData = {
      ...formData,
      leaderId: user?.id || '',
    };

    const result = await createOpportunity(submissionData);
    if (result.success) {
      setShowCreateForm(false);
    }
    return result;
  };

  const handleDeleteOpportunity = async (id: string) => {
    return await deleteOpportunity(id);
  };

  const handleUpdateApplicationStatus = async (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    return await updateApplicationStatus(id, status);
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (user.role !== 'MINISTRY_LEADER') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to continue
          </h2>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'MINISTRY_LEADER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            This page is only available to ministry leaders.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (opportunitiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ministry Leader Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage volunteer opportunities and recruit passionate servants
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Opportunity
            </button>
          </div>
        </div>

        <DashboardStats stats={stats} loading={opportunitiesLoading} />

        {opportunitiesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{opportunitiesError}</p>
          </div>
        )}

        {showCreateForm && (
          <OpportunityForm
            onSubmit={handleCreateOpportunity}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {showApplications ? (
          <ApplicationList
            applications={applications}
            loading={applicationsLoading}
            onUpdateStatus={handleUpdateApplicationStatus}
            onBack={() => setShowApplications(false)}
          />
        ) : (
          <OpportunityList
            opportunities={opportunities}
            loading={opportunitiesLoading}
            onDelete={handleDeleteOpportunity}
            onToggleApplications={() => setShowApplications(true)}
          />
        )}

        <div className="mt-8 text-center">
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
