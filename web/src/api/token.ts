// Persists the JWT in localStorage so the user stays logged in across page reloads.
// Every access is wrapped in try/catch because storage can be unavailable
// (private browsing modes, blocked cookies, etc.).

const TOKEN_KEY = 'changepp_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable: the session will simply last until the page reloads.
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}