// Typed wrappers for the /api/auth endpoints.

import { request } from './client';
import type { AuthResponse, User } from '../types';

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(email: string, username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: { email, username, password },
  });
}

export async function fetchCurrentUser(): Promise<User> {
  const data = await request<{ user: User }>('/api/auth/me');
  return data.user;
}