// Typed wrappers for the /api/notifications endpoints.

import { request } from './client';
import type { NotificationsResponse } from '../types';

export function fetchNotifications(): Promise<NotificationsResponse> {
  return request<NotificationsResponse>('/api/notifications');
}

export function markNotificationRead(id: number): Promise<void> {
  return request<void>(`/api/notifications/${id}/read`, { method: 'POST' });
}

export function markAllNotificationsRead(): Promise<void> {
  return request<void>('/api/notifications/read-all', { method: 'POST' });
}