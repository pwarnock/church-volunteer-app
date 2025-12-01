'use client';

import { useSearchParams } from 'next/navigation';
import { SignUpForm } from '@/components/auth/signup-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function SignUp() {
  const searchParams = useSearchParams();
  
  // Check if user was redirected from auth message
  const message = searchParams?.get('message');
  
  let authMessage;
  if (message) {
    switch (message) {
      case 'session-expired':
        authMessage = {
          type: 'info' as const,
          text: 'Your session has expired. Please sign in again.',
        };
        break;
      case 'signin-required':
        authMessage = {
          type: 'info' as const,
          text: 'Please sign in to access this page.',
        };
        break;
      default:
        authMessage = {
          type: 'info' as const,
          text: message,
        };
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join our church volunteer platform"
      message={authMessage}
      backButton={{
        href: '/auth/signin',
        label: 'Already have an account? Sign in'
      }}
    >
      <SignUpForm />
    </AuthLayout>
  );
}