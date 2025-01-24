import { useEffect, useState } from 'react';
import { Notification } from '@prisma/client';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} from '@/actions/notifications';

export function useNotifications() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoading(true);

      const result = await getUnreadNotificationsCount();
      setCount(result.count);
    };

    const fetchNotifications = async () => {
      setIsLoading(true);

      const result = await getNotifications();
      setNotifications(result);
    };

    const promises = [fetchCount(), fetchNotifications()];

    Promise.all(promises).then(() => {
      setIsLoading(false);
    });
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (notificationId: string) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      setCount((prev) => Math.max(0, prev - 1));
    }
    return result;
  };

  return {
    unreadCount: count,
    notifications,
    isLoading,
    markAsRead,
  };
}
