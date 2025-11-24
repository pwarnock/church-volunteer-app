/**
 * Use Applications Hook
 *
 * Domain: Leader dashboard data management
 * Responsibility: Manage application data fetching and state
 * Boundaries: Data fetching only, no UI components
 */

import { useState, useEffect } from 'react';
import { Application } from '../types/leader.types';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    id: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setApplications((prev) =>
          (prev || []).map((app) =>
            app.id === id ? { ...app, status: status as any } : app
          )
        );
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Error updating application:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    updateApplicationStatus,
    refetch: fetchApplications,
  };
}
