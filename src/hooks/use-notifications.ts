'use client';

import { useEffect, useCallback } from 'react';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import { NotificationType } from '@prisma/client';

interface UseNotificationsOptions {
  unreadOnly?: boolean;
  types?: NotificationType[];
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const utils = api.useUtils();

  const query = api.notifications.getList.useInfiniteQuery(
    {
      limit: options?.limit ?? 20,
      unreadOnly: options?.unreadOnly ?? false,
      types: options?.types,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 30 * 1000, // 30 secondes
      refetchInterval: options?.autoRefresh ? (options.refreshInterval ?? 30000) : false,
    },
  );

  const markAsReadMutation = api.notifications.markAsRead.useMutation({
    onMutate: async ({ id }) => {
      // Optimistic update
      await utils.notifications.getList.cancel();
      await utils.notifications.getUnreadCount.cancel();

      const previousData = utils.notifications.getList.getInfiniteData({
        limit: options?.limit ?? 20,
        unreadOnly: options?.unreadOnly ?? false,
        types: options?.types,
      });

      if (previousData) {
        utils.notifications.getList.setInfiniteData(
          {
            limit: options?.limit ?? 20,
            unreadOnly: options?.unreadOnly ?? false,
            types: options?.types,
          },
          {
            ...previousData,
            pages: previousData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification,
              ),
            })),
          },
        );
      }

      // Mettre à jour le compteur
      const previousCount = utils.notifications.getUnreadCount.getData();
      if (previousCount && previousCount.count > 0) {
        utils.notifications.getUnreadCount.setData(undefined, {
          count: previousCount.count - 1,
        });
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousData) {
        utils.notifications.getList.setInfiniteData(
          {
            limit: options?.limit ?? 20,
            unreadOnly: options?.unreadOnly ?? false,
            types: options?.types,
          },
          context.previousData,
        );
      }
      toast.error('Erreur lors du marquage de la notification');
    },
    onSuccess: () => {
      utils.notifications.getList.invalidate();
      utils.notifications.getUnreadCount.invalidate();
    },
  });

  const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getList.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success('Toutes les notifications ont été marquées comme lues');
    },
    onError: () => {
      toast.error('Erreur lors du marquage des notifications');
    },
  });

  const deleteMutation = api.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.getList.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      toast.success('Notification supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const deleteAllReadMutation = api.notifications.deleteAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.getList.invalidate();
      toast.success('Notifications lues supprimées');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const notifications = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    notifications,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    deleteAllRead: deleteAllReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: query.refetch,
  };
}

export function useUnreadCount() {
  const query = api.notifications.getUnreadCount.useQuery(undefined, {
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 30 * 1000, // Rafraîchir toutes les 30 secondes
  });

  return {
    count: query.data ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useNotificationPreferences() {
  const utils = api.useUtils();

  const query = api.notifications.getPreferences.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = api.notifications.updatePreferences.useMutation({
    onMutate: async ({ type, channel, enabled }) => {
      // Optimistic update
      await utils.notifications.getPreferences.cancel();

      const previousData = utils.notifications.getPreferences.getData();

      if (previousData) {
        const newData = { ...previousData };
        if (!newData[type]) {
          newData[type] = {};
        }
        newData[type][channel] = enabled;

        utils.notifications.getPreferences.setData(undefined, newData);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousData) {
        utils.notifications.getPreferences.setData(undefined, context.previousData);
      }
      toast.error('Erreur lors de la mise à jour des préférences');
    },
    onSuccess: () => {
      toast.success('Préférences mises à jour');
    },
  });

  return {
    preferences: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    updatePreference: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useNotificationStats() {
  const query = api.notifications.getStats.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useCreateNotification() {
  const utils = api.useUtils();

  const mutation = api.notifications.create.useMutation({
    onSuccess: () => {
      utils.notifications.getList.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getStats.invalidate();
      toast.success('Notification créée');
    },
    onError: () => {
      toast.error('Erreur lors de la création de la notification');
    },
  });

  return {
    createNotification: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

// Hook pour le polling temps réel des notifications
export function useRealtimeNotifications(
  onNewNotification?: (notification: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
  }) => void,
) {
  const utils = api.useUtils();
  const { count: previousCount } = useUnreadCount();

  const checkForNewNotifications = useCallback(async () => {
    const currentData = await utils.notifications.getUnreadCount.fetch();

    if (currentData.count > previousCount) {
      // Nouvelle notification détectée
      const latestNotifications = await utils.notifications.getList.fetch({
        limit: 1,
        unreadOnly: true,
      });

      if (latestNotifications.items.length > 0 && onNewNotification) {
        const notification = latestNotifications.items[0];
        if (notification) {
          onNewNotification({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt,
          });
        }
      }

      // Rafraîchir les listes
      utils.notifications.getList.invalidate();
      utils.notifications.getStats.invalidate();
    }
  }, [previousCount, utils, onNewNotification]);

  useEffect(() => {
    const interval = setInterval(checkForNewNotifications, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(interval);
  }, [checkForNewNotifications]);
}
