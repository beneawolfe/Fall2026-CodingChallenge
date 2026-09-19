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

// One entry from GET /api/notifications.
// Named AppNotification to avoid clashing with the browser's built-in Notification type.
export interface AppNotification {
  id: number;
  collectionId: number | null;
  collectionName: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Response body of GET /api/notifications
export interface NotificationsResponse {
  unreadCount: number;
  notifications: AppNotification[];
}