'use client';

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

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return 'border-destructive text-destructive bg-destructive/20';
      case 'default':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-foreground/10 text-foreground/50';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full text-xs font-medium min-w-[1.25rem] h-5 px-1.5',
        getVariantStyles(variant),
        className,
      )}
    >
      {formatCount(count)}
    </span>
  );
}
