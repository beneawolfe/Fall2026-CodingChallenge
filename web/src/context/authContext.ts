// Defines the shape of the auth context and creates it.
// The provider component lives in AuthProvider.tsx and the hook in hooks/useAuth.ts;
// keeping them in separate files keeps React fast-refresh (and the linter) happy.

import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextValue {
  /** The logged-in user, or null when logged out. */
  user: User | null;
  /** True while we're verifying a stored token on first page load. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);