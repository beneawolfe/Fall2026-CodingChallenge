// Loads the user's notifications, keeps them fresh by polling, and supports
// marking items read. Marking read is optimistic: the UI updates immediately
// and rolls back if the server request fails.

import { useCallback, useEffect, useState } from 'react';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import type { AppNotification } from '../types';

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Re-fetch from the server. Only called from event handlers (rollback),
  // never directly from an effect body.
  const refresh = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Notifications are best-effort: a failed request shouldn't disturb the page.
    }
  }, []);

  // Load once on mount, then poll while the tab is visible.
  // State is only set inside promise callbacks, and `cancelled` makes sure a
  // late response after unmount is ignored.
  useEffect(() => {
    let cancelled = false;

    function load() {
      fetchNotifications()
        .then((data) => {
          if (cancelled) return;
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        })
        .catch(() => {
          // Best-effort: ignore failed polls.
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    const id = window.setInterval(() => {
      if (!document.hidden) load();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const markRead = useCallback(
    async (id: number) => {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.isRead) return;

      // Optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((count) => Math.max(0, count - 1));

      try {
        await markNotificationRead(id);
      } catch {
        // Roll back
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
        setUnreadCount((count) => count + 1);
      }
    },
    [notifications],
  );

  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsRead();
    } catch {
      // Roll back by reloading the real state from the server
      await refresh();
    }
  }, [refresh]);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}