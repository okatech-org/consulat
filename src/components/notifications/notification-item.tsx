'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Notification } from '@prisma/client';
import { useNotifications } from '@/hooks/use-notifications';
import { memo } from 'react';
import { currentFnsLocale } from '@/lib/utils';
import { useLocale } from 'next-intl';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
}: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const localeString = useLocale();
  const locale = currentFnsLocale(localeString);
  const handleClick = () => markAsRead(notification.id);
  const handleKeyDown = (e: React.KeyboardEvent) =>
    e.key === 'Enter' && markAsRead(notification.id);

  return (
    <div
      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-muted/20' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-1">
        <h5 className="font-medium">{notification.title}</h5>
        <p
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: notification.message }}
        />
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: locale,
          })}
        </span>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';
