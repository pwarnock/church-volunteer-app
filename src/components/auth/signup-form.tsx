'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormField, SelectField } from '@/components/ui/form-field';
import { GoogleAuthButton, GitHubAuthButton } from '@/components/ui/oauth-button';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'VOLUNTEER' | 'MINISTRY_LEADER';
}

interface SignUpFormProps {
  redirectTo?: string;
}

export function SignUpForm({ redirectTo = '/dashboard' }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'VOLUNTEER',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-signin after successful signup
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      router.push(redirectTo);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn('google', { 
        callbackUrl: redirectTo,
        redirect: false 
      });

      if (result?.error) {
        throw new Error('Google sign-in failed');
      }

      // Handle successful Google auth
      if (result?.ok) {
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn('github', { 
        callbackUrl: redirectTo,
        redirect: false 
      });

      if (result?.error) {
        throw new Error('GitHub sign-in failed');
      }

      if (result?.ok) {
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.message || 'GitHub sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'MINISTRY_LEADER', label: 'Post Opportunities' },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Join our church volunteer platform
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <GoogleAuthButton
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          Continue with Google
        </GoogleAuthButton>

        <GitHubAuthButton
          onClick={handleGitHubSignup}
          disabled={isLoading}
        >
          Continue with GitHub
        </GitHubAuthButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleEmailSignup}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <FormField
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            error={fieldErrors.name}
            disabled={isLoading}
            placeholder="John Doe"
          />

          <FormField
            id="email"
            name="email"
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            error={fieldErrors.email}
            disabled={isLoading}
            placeholder="john@example.com"
          />

          <SelectField
            id="role"
            name="role"
            label="I want to"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            disabled={isLoading}
          />

          <FormField
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            error={fieldErrors.password}
            disabled={isLoading}
            placeholder="•••••••••"
          />

          <FormField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            disabled={isLoading}
            placeholder="•••••••••"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}