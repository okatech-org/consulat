'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Notification } from '@prisma/client';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotifications,
} from '@/actions/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Mise à jour optimiste
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // En cas d'erreur, recharger les notifications
      fetchNotifications();
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Mise à jour optimiste
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // En cas d'erreur, recharger les notifications
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: fetchNotifications,
  };
}
