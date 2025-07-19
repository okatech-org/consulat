import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { notificationsRouter } from './notifications';

// Types d'input pour toutes les procédures du router notifications
export type NotificationsRouterInputs = inferRouterInputs<typeof notificationsRouter>;

// Types d'output pour toutes les procédures du router notifications
export type NotificationsRouterOutputs = inferRouterOutputs<typeof notificationsRouter>;

// Types spécifiques pour getList
export type GetNotificationListInput = NotificationsRouterInputs['getList'];
export type NotificationList = NotificationsRouterOutputs['getList'];

// Types pour getUnreadCount
export type UnreadNotificationCount = NotificationsRouterOutputs['getUnreadCount'];

// Types pour markAsRead
export type MarkAsReadInput = NotificationsRouterInputs['markAsRead'];
export type MarkAsReadResult = NotificationsRouterOutputs['markAsRead'];

// Types pour markAllAsRead
export type MarkAllAsReadResult = NotificationsRouterOutputs['markAllAsRead'];

// Types pour delete
export type DeleteNotificationInput = NotificationsRouterInputs['delete'];
export type DeleteNotificationResult = NotificationsRouterOutputs['delete'];

// Types pour deleteAllRead
export type DeleteAllReadResult = NotificationsRouterOutputs['deleteAllRead'];

// Types pour getPreferences
export type NotificationPreferences = NotificationsRouterOutputs['getPreferences'];

// Types pour updatePreferences
export type UpdateNotificationPreferencesInput =
  NotificationsRouterInputs['updatePreferences'];
export type UpdateNotificationPreferencesResult =
  NotificationsRouterOutputs['updatePreferences'];

// Types pour create
export type CreateNotificationInput = NotificationsRouterInputs['create'];
export type CreateNotificationResult = NotificationsRouterOutputs['create'];

// Types pour getStats
export type NotificationStats = NotificationsRouterOutputs['getStats'];
