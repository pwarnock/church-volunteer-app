'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ActionCard } from '@/components/ui/action-card';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { RoleBasedContent } from '@/components/ui/role-based-content';

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <DashboardLayout session={session}>
      <RoleBasedContent session={session}>
        {{
          volunteer: (
            <>
              <ActionCard
                icon="search"
                title="Spiritual Gifts Assessment"
                description="Take our assessment to discover your spiritual gifts and find perfect place to serve."
                href="/volunteer/assessment"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                buttonColor="bg-blue-600"
                buttonHoverColor="hover:bg-blue-700"
              />

              <ActionCard
                icon="clipboard"
                title="Browse Opportunities"
                description="Explore available volunteer opportunities across different ministries."
                href="/volunteer/opportunities"
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                buttonColor="bg-green-600"
                buttonHoverColor="hover:bg-green-700"
              />
            </>
          ),

          leader: (
            <>
              <ActionCard
                icon="plus"
                title="Create Opportunity"
                description="Post new volunteer opportunities for your ministry and recruit passionate servants."
                href="/leader"
                iconBgColor="bg-purple-100"
                iconColor="text-purple-600"
                buttonColor="bg-purple-600"
                buttonHoverColor="hover:bg-purple-700"
              />

              <ActionCard
                icon="users"
                title="View Applications"
                description="Review and manage volunteer applications for your ministry opportunities."
                href="/leader/applications"
                iconBgColor="bg-orange-100"
                iconColor="text-orange-600"
                buttonColor="bg-orange-600"
                buttonHoverColor="hover:bg-orange-700"
              />
            </>
          ),

          admin: (
            <>
              <ActionCard
                icon="cog"
                title="Admin Dashboard"
                description="Manage users, opportunities, and platform settings."
                href="/admin"
                iconBgColor="bg-red-100"
                iconColor="text-red-600"
                buttonColor="bg-red-600"
                buttonHoverColor="hover:bg-red-700"
              />

              <ActionCard
                icon="chart"
                title="Platform Analytics"
                description="View platform usage metrics and generate reports."
                href="/admin/analytics"
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
                buttonColor="bg-yellow-600"
                buttonHoverColor="hover:bg-yellow-700"
              />
            </>
          ),
        }}
      </RoleBasedContent>

      {session && (
        <div className="text-center mt-12">
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Sign out
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
