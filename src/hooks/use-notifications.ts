'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import type { Notification } from '@prisma/client';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotifications,
} from '@/actions/notifications';

// Cache structure
type NotificationsCache = {
  data: Notification[];
  timestamp: number;
  lastId: string | null;
};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Global cache object
let globalCache: NotificationsCache = {
  data: [],
  timestamp: 0,
  lastId: null,
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(globalCache.data);
  const [isLoading, setIsLoading] = useState(globalCache.data.length === 0);
  const [lastUpdated, setLastUpdated] = useState<number>(globalCache.timestamp);
  const [error, setError] = useState<Error | null>(null);

  // Only fetch if cache is expired or we have no data
  const shouldFetchFromServer = useCallback(() => {
    const now = Date.now();
    return (
      globalCache.data.length === 0 || now - globalCache.timestamp > CACHE_EXPIRATION
    );
  }, []);

  // Load notifications with cache strategy
  const fetchNotifications = useCallback(
    async (force = false) => {
      // Return cached data if available and not forcing refresh
      if (!force && !shouldFetchFromServer() && globalCache.data.length > 0) {
        setNotifications(globalCache.data);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getNotifications();

        if (result && Array.isArray(result)) {
          // Update cache
          globalCache = {
            data: result,
            timestamp: Date.now(),
            lastId: result.length > 0 ? (result[0]?.id ?? null) : null,
          };

          setNotifications(result);
          setLastUpdated(globalCache.timestamp);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    },
    [shouldFetchFromServer],
  );

  // Initial load and refresh every minute
  useEffect(() => {
    fetchNotifications();

    // Poll less frequently
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 1 minute instead of 30s

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark a notification as read with optimistic updates
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );

      try {
        await markNotificationAsRead(notificationId);

        // Update cache on success
        globalCache.data = globalCache.data.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
        // Revert optimistic update on error
        fetchNotifications(true);
      }
    },
    [fetchNotifications],
  );

  // Mark all notifications as read with optimistic updates
  const handleMarkAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllNotificationsAsRead();

      // Update cache on success
      globalCache.data = globalCache.data.map((n) => ({ ...n, read: true }));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Revert optimistic update on error
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // Calculate unreadCount efficiently using useMemo
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    lastUpdated,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: useCallback(() => fetchNotifications(true), [fetchNotifications]),
  };
}
