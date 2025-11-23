/**
 * Use Opportunities Hook
 *
 * Domain: Leader dashboard data management
 * Responsibility: Manage opportunity data fetching and state
 * Boundaries: Data fetching only, no UI components
 */

import { useState, useEffect } from 'react';
import { Opportunity } from '../types/leader.types';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/opportunities');
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data.opportunities || []);
      } else {
        setError('Failed to fetch opportunities');
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createOpportunity = async (formData: any) => {
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchOpportunities(); // Refresh list
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const response = await fetch(`/api/opportunities/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOpportunities((prev) => prev.filter((opp) => opp.id !== id));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to delete opportunity' };
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    createOpportunity,
    deleteOpportunity,
    refetch: fetchOpportunities,
  };
}
