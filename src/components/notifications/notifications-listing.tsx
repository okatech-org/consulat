'use client';

import { useTranslations } from 'next-intl';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from './notification-item';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function NotificationsListing() {
  const t = useTranslations('notifications');
  const { notifications, markAllAsRead, unreadCount } = useNotifications();

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

      {unreadCount > 0 && (
        <div className="flex justify-end px-4">
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="size-4 mr-2" />
            {t('mark_all_read')}
          </Button>
        </div>
      )}
    </div>
  );
}
