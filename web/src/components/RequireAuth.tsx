// Route guard: only lets logged-in users through to the nested routes.
// Everyone else is sent to /login, and we remember where they were headed
// so they can be returned there after signing in.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullPageSpinner from './FullPageSpinner';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}