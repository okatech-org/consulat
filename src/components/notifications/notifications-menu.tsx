'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/use-notifications';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Doc } from '@/convex/_generated/dataModel';

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Doc<'notifications'>;
  onRead: () => Promise<void>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRead = async () => {
    setIsLoading(true);
    try {
      await onRead();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 border-b last:border-0',
        !notification.read && 'bg-muted/50',
      )}
    >
      <div className="flex-1">
        <h4 className="text-sm font-medium">{notification.title}</h4>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <span className="text-xs text-muted-foreground">
          {format(new Date(notification.createdAt), 'PPp', { locale: fr })}
        </span>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="mobile"
          onClick={handleRead}
          disabled={isLoading}
          leftIcon={isLoading ? <Loader2 className="animate-spin" /> : <Check />}
        >
          {isLoading ? '' : ''}
        </Button>
      )}
    </div>
  );
}

export function NotificationsMenu() {
  const t = useTranslations('notifications');
  const { unreadCount, markAsRead, notifications } = useNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative max-w-min p-2"
          size="mobile"
          leftIcon={<Bell />}
        >
          <span>{t('title')}</span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center justify-between pb-4">
          <h3 className="font-medium">{t('title')}</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="mobile">
              {t('mark_all_read')}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => handleMarkAsRead(notification.id)}
              />
            ))
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <Bell className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('empty')}</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
