import { Navigate } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/Spinner';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

// Guards a route: waits for session restore, requires auth, then checks roles.
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Authenticating" />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
