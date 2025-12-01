import { Session } from 'next-auth';
import Link from 'next/link';

interface DashboardLayoutProps {
  session: Session | null;
  children: React.ReactNode;
}

export function DashboardLayout({ session, children }: DashboardLayoutProps) {
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to continue
          </h2>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const isVolunteer = session.user.role === 'VOLUNTEER';
  const isLeader = session.user.role === 'MINISTRY_LEADER';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-xl text-gray-600">
            {isVolunteer
              ? 'Discover opportunities to serve and use your spiritual gifts'
              : isLeader
                ? 'Manage your ministry opportunities and connect with volunteers'
                : 'Manage the church volunteer platform'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export function DashboardHeader({ session }: { session: Session }) {
  const isVolunteer = session.user.role === 'VOLUNTEER';
  const isLeader = session.user.role === 'MINISTRY_LEADER';

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome back, {session.user.name}!
      </h1>
      <p className="text-xl text-gray-600">
        {isVolunteer
          ? 'Discover opportunities to serve and use your spiritual gifts'
          : isLeader
            ? 'Manage your ministry opportunities and connect with volunteers'
            : 'Manage the church volunteer platform'}
      </p>
    </div>
  );
}