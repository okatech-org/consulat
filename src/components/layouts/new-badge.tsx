'use client';

import { cn } from '@/lib/utils';

interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full text-xs font-medium min-w-[3.5rem] h-5 px-2 bg-green-500 text-white',
        className,
      )}
    >
      Nouveau
    </span>
  );
}
