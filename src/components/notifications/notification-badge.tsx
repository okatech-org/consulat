'use client';

import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';

export function NotificationBadge() {
  const { unreadCount, isLoading } = useNotifications();

  if (isLoading || unreadCount === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className="absolute -right-2 -top-2 size-5 rounded-full p-0"
    >
      {unreadCount}
    </Badge>
  );
}
