'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mx-auto mb-2`}
      ></div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LoadingState({
  isLoading,
  children,
  fallback,
}: LoadingStateProps) {
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  return <>{children}</>;
}

export default LoadingSpinner;
