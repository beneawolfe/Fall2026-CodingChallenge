// Low-level typed fetch wrapper used by every API call in the app.
// - Prefixes the base URL from VITE_API_URL
// - Attaches the Bearer token when one is stored
// - Converts backend errors ({ "error": "..." }) into ApiError exceptions
// - Handles 204 No Content responses
// - Notifies the app when a logged-in session is rejected (expired/invalid token)

import { clearToken, getToken } from './token';
import type { ApiErrorBody } from '../types';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:5001';

/** Error thrown for any failed request. `status` is 0 when the server can't be reached. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// AuthProvider registers a callback here so an expired token logs the user out everywhere.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    // Let deliberate cancellations (AbortController) pass through untouched
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Cannot reach the server. Check your connection and try again.');
  }

  // A 401 while holding a token means the session expired or the token is invalid.
  // (A wrong password at login returns 401 too, but no token is sent then.)
  if (response.status === 401 && token) {
    clearToken();
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as Partial<ApiErrorBody>;
      if (data.error) message = data.error;
    } catch {
      // Response body wasn't JSON; keep the generic message.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}