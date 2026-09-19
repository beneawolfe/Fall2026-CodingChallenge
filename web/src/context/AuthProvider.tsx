// Holds the current user and exposes login / register / logout to the whole app.
// On first load, if a token is stored, it is verified with GET /api/auth/me.

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';
import { fetchCurrentUser, login as loginRequest, register as registerRequest } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { clearToken, getToken, setToken } from '../api/token';
import type { User } from '../types';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" if there's a stored token that needs verifying
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null);

  // Verify a stored token once, when the app first loads
  useEffect(() => {
    let cancelled = false;

    if (getToken()) {
      fetchCurrentUser()
        .then((current) => {
          if (!cancelled) setUser(current);
        })
        .catch(() => {
          // Invalid or expired token: drop it and treat the visitor as logged out
          clearToken();
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // If any later request gets a 401, the API client clears the token and calls this
  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedIn } = await loginRequest(email, password);
    setToken(token);
    setUser(loggedIn);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const { token, user: created } = await registerRequest(email, username, password);
    setToken(token);
    setUser(created);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}