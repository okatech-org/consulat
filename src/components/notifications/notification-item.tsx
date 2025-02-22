'use client';

import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '@prisma/client';
import { useNotifications } from '@/hooks/use-notifications';
import { memo } from 'react';
import { currentFnsLocale } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
}: NotificationItemProps) {
  const { markAsRead } = useNotifications();
  const t = useTranslations('notifications');
  const localeString = useLocale();
  const locale = currentFnsLocale(localeString);

  return (
    <div
      className={cn('p-4 hover:bg-muted/50 transition-colors', {
        'bg-muted/20': !notification.read,
      })}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h5 className="font-medium">{notification.title}</h5>
          <div
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: notification.message }}
          />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale,
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!notification.read && (
            <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
              <Check className="size-4" />
              <span className="sr-only">{t('actions.mark_as_read')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';
