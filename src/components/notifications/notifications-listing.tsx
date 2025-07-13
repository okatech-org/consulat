'use client';

import { useTranslations } from 'next-intl';
import { useNotifications, useUnreadCount } from '@/hooks/use-notifications';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export function NotificationsListing() {
  const t = useTranslations('notifications');
  const {
    notifications,
    markAllAsRead,
    deleteAllRead,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const { count: unreadCount } = useUnreadCount();

  if (isLoading) {
    return <LoadingSkeleton variant="list" count={4} />;
  }

  return (
    <div className="space-y-2">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-4">
            {t('empty')}
          </div>
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t('actions.loading_more') : t('actions.load_more')}
          </Button>
        </div>
      )}

      {(unreadCount > 0 || notifications.some((n) => n.read)) && (
        <div className="flex justify-between px-4 pt-4 border-t">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Check className="size-4" />}
              onClick={() => markAllAsRead()}
            >
              {t('actions.mark_all_read')}
            </Button>
          )}
          {notifications.some((n) => n.read) && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() => deleteAllRead()}
            >
              {t('actions.delete_all_read')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
