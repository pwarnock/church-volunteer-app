import { Session } from 'next-auth';

interface RoleBasedContentProps {
  session: Session | null;
  children: {
    volunteer?: React.ReactNode;
    leader?: React.ReactNode;
    admin?: React.ReactNode;
    fallback?: React.ReactNode;
  };
}

export function RoleBasedContent({ session, children }: RoleBasedContentProps) {
  if (!session) {
    return <>{children.fallback}</>;
  }

  const userRole = session.user?.role;

  switch (userRole) {
    case 'VOLUNTEER':
      return <>{children.volunteer}</>;
    case 'MINISTRY_LEADER':
      return <>{children.leader}</>;
    case 'ADMIN':
      return <>{children.admin || children.leader}</>; // Admin gets leader content
    default:
      return <>{children.fallback}</>;
  }
}

export function useRole(session: Session | null) {
  if (!session) return { isVolunteer: false, isLeader: false, isAdmin: false };

  return {
    isVolunteer: session.user?.role === 'VOLUNTEER',
    isLeader: session.user?.role === 'MINISTRY_LEADER',
    isAdmin: session.user?.role === 'ADMIN',
  };
}