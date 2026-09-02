import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  /** Further restricts an already-console-gated route to the ADMIN role. */
  adminOnly?: boolean;
}

/** Gates the doctor console: only clinicians and admins get past login. */
export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { session, isConsoleUser } = useAuth();

  if (!session || !isConsoleUser) {
    return <Navigate to="/console/login" replace />;
  }

  if (adminOnly && session.role !== 'ADMIN') {
    return <Navigate to="/console" replace />;
  }

  return <Outlet />;
}
