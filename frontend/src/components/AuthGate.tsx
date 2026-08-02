import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui';

/**
 * Wraps the AppShell layout. If the user is not authenticated, redirect
 * to /login (preserving where they were trying to go). While the first
 * /api/me call is in flight, show a full-screen loader so we don't
 * flash the login page on every hard refresh.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
