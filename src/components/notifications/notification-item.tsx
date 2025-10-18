'use client';

import { formatDistanceToNow } from 'date-fns';
import { memo } from 'react';
import { currentFnsLocale } from '@/lib/utils';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { Doc } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface NotificationItemProps {
  notification: Doc<'notifications'>;
}

export const NotificationItem = memo(function NotificationItem({
  notification,
}: NotificationItemProps) {
  const markAsRead = useMutation(api.functions.notification.markNotificationAsRead);
  const t = useTranslations('notifications');
  const localeString = useLocale();
  const locale = currentFnsLocale(localeString);

  return (
    <div
      className={cn('p-4 hover:bg-muted/50 transition-colors', {
        'bg-muted/20': !notification.readAt,
      })}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h5 className="font-medium">{notification.title}</h5>
          <div
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: notification.content }}
          />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification._creationTime), {
              addSuffix: true,
              locale,
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!notification.readAt && (
            <Button
              variant="ghost"
              size="icon-sm"
              leftIcon={<Check className="size-4" />}
              onClick={() => markAsRead({ notificationId: notification._id })}
            >
              <span className="sr-only">{t('actions.mark_as_read')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';
