import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { KeyAuthModal } from '../features/auth/components/KeyAuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

/**
 * Protected route that ensures user is authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isInitialized } = useAuthStore();

  // Still initializing
  if (!isInitialized) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"/>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return <KeyAuthModal />;
  }

  // User doesn't have required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            Access Denied
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This section requires {requiredRole} privileges
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
