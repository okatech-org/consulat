'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CountBadgeProps {
  count: number;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function CountBadge({ count, variant = 'secondary', className }: CountBadgeProps) {
  if (count === 0) return null;

  const formatCount = (count: number) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  return (
    <Badge variant={variant} className={cn('ml-auto', className)}>
      {formatCount(count)}
    </Badge>
  );
}
