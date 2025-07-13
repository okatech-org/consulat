'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  return (
    <Badge
      variant="default"
      className={cn('ml-auto bg-green-500 hover:bg-green-600', className)}
    >
      Nouveau
    </Badge>
  );
}
