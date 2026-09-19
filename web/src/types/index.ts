// Shared TypeScript types describing the data the backend API sends and receives.

export interface User {
  id: number;
  email: string;
  username: string;
}

// Response body of POST /api/auth/login and POST /api/auth/register
export interface AuthResponse {
  token: string;
  user: User;
}

// Every backend error has this shape: { "error": "message" }
export interface ApiErrorBody {
  error: string;
}