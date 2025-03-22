import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact' | 'centered';
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionClassName?: string;
  iconContainerClassName?: string;
  bordered?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
  iconClassName,
  titleClassName,
  descriptionClassName,
  actionClassName,
  iconContainerClassName,
  bordered = true,
  ...props
}: EmptyStateProps) {
  const isCompact = variant === 'compact';
  const isCentered = variant === 'centered';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 sm:p-8 text-center',
        'animate-in fade-in-50 duration-300',
        isCompact ? 'min-h-[200px] gap-3' : 'min-h-[300px] gap-4',
        isCentered && 'absolute inset-0',
        bordered && 'rounded-lg border border-dashed',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-muted',
          isCompact ? 'size-10' : 'size-16',
          iconContainerClassName,
        )}
      >
        <Icon
          className={cn(
            'text-muted-foreground',
            isCompact ? 'size-5' : 'size-8',
            iconClassName,
          )}
        />
      </div>

      <h3
        className={cn(
          'font-semibold text-foreground',
          isCompact ? 'text-base' : 'text-xl',
          titleClassName,
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'text-muted-foreground max-w-[90%] sm:max-w-[70%]',
          isCompact ? 'text-sm' : 'text-base',
          descriptionClassName,
        )}
      >
        {description}
      </p>

      {action && (
        <div className={cn('mt-2 sm:mt-4 w-full max-w-xs', actionClassName)}>
          {action}
        </div>
      )}
    </div>
  );
}
