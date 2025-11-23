/**
 * Leader Dashboard Types
 *
 * Domain: Leader dashboard data structures
 * Responsibility: TypeScript interfaces for leader functionality
 * Boundaries: Type definitions only, no implementation
 */

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  ministry: string;
  location: string;
  requirements: string[];
  timeCommitment: string;
  startDate?: string;
  endDate?: string;
  status: string;
  _count: {
    applications: number;
  };
}

export interface VolunteerProfile {
  spiritualGifts?: string;
}

export interface Volunteer {
  name: string;
  email: string;
  profile?: VolunteerProfile;
}

export interface Application {
  id: string;
  volunteer: Volunteer;
  opportunity: {
    title: string;
  };
  message?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface OpportunityFormData {
  title: string;
  description: string;
  ministry: string;
  location: string;
  requirements: string | string[];
  timeCommitment: string;
  startDate: string;
  endDate: string;
}

export interface LeaderDashboardStats {
  totalOpportunities: number;
  activeOpportunities: number;
  totalApplications: number;
  pendingApplications: number;
}
