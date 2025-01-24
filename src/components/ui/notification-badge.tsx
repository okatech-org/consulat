import * as React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function NotificationBadge({
  count,
  max = 99,
  className,
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground',
        className,
      )}
    >
      {displayCount}
    </span>
  );
}
