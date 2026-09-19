// Route guard for pages like /login and /register: already-logged-in users
// are redirected away (back to where they came from, or the home page).

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import FullPageSpinner from './FullPageSpinner';
import { useAuth } from '../hooks/useAuth';

export default function GuestOnly() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (user) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}