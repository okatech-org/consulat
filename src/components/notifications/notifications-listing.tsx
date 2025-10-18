'use client';

import { useTranslations } from 'next-intl';
import { NotificationItem } from './notification-item';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';

export function NotificationsListing() {
  const { user } = useCurrentUser();
  const notifications = useQuery(
    api.functions.notification.getUnreadNotifications,
    user?._id ? { userId: user._id } : 'skip',
  );
  const t = useTranslations('notifications');

  if (!notifications) {
    return <LoadingSkeleton variant="list" count={4} />;
  }

  return (
    <div className="space-y-2">
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification._id} notification={notification} />
        ))}

        {notifications.length === 0 && (
          <div className="text-center text-sm text-muted-foreground p-4">
            {t('empty')}
          </div>
        )}
      </div>
    </div>
  );
}
