'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'card'
    | 'list'
    | 'grid'
    | 'form'
    | 'text'
    | 'avatar'
    | 'custom'
    | 'button'
    | 'circle';
  count?: number;
  rows?: number;
  columns?: number;
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: '1/1' | '16/9' | '4/3' | '1/2';
  fullWidth?: boolean;
  centerItems?: boolean;
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  (
    {
      className,
      variant = 'card',
      count = 1,
      rows = 1,
      columns = 1,
      size = 'md',
      aspectRatio,
      fullWidth = false,
      centerItems = false,
      ...props
    },
    ref,
  ) => {
    // Get size dimensions based on the size prop
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return {
            card: 'h-32 w-full sm:w-64',
            list: 'h-16',
            avatarSize: 'size-8',
            textHeight: 'h-4',
            gap: 'gap-2',
            padding: 'p-2',
          };
        case 'lg':
          return {
            card: 'h-64 w-full sm:w-96',
            list: 'h-28',
            avatarSize: 'size-16',
            textHeight: 'h-6',
            gap: 'gap-6',
            padding: 'p-6',
          };
        default: // md
          return {
            card: 'h-48 w-full sm:w-80',
            list: 'h-20',
            avatarSize: 'size-12',
            textHeight: 'h-5',
            gap: 'gap-4',
            padding: 'p-4',
          };
      }
    };

    const sizeClasses = getSizeClasses();

    // Generate card skeleton
    const renderCardSkeleton = (index: number) => (
      <div
        key={index}
        className={cn(
          'animate-pulse rounded-lg border bg-card',
          aspectRatio ? `aspect-${aspectRatio}` : sizeClasses.card,
          sizeClasses.padding,
          fullWidth && 'w-full',
          className,
        )}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="space-y-3">
            <div className={cn('h-3 w-3/4 rounded-md bg-muted')} />
            <div className={cn('h-3 w-1/2 rounded-md bg-muted')} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn('h-3 w-1/4 rounded-md bg-muted')} />
              <div className={cn('h-3 w-1/4 rounded-md bg-muted')} />
            </div>
            <div className={cn('h-3 w-1/3 rounded-md bg-muted')} />
          </div>
        </div>
      </div>
    );

    // Generate list skeleton
    const renderListSkeleton = (index: number) => (
      <div
        key={index}
        className={cn(
          'animate-pulse flex items-center rounded-lg border bg-card',
          sizeClasses.list,
          sizeClasses.padding,
          'w-full',
          className,
        )}
      >
        <div className={cn('rounded-full bg-muted', sizeClasses.avatarSize)} />
        <div className="ml-4 flex-1">
          <div className={cn('mb-2 h-3 w-1/2 rounded-md bg-muted')} />
          <div className={cn('h-2 w-3/4 rounded-md bg-muted')} />
        </div>
        <div className={cn('h-3 w-12 rounded-md bg-muted')} />
      </div>
    );

    // Generate grid skeleton
    const renderGridSkeleton = () => (
      <div
        className={cn(
          'grid gap-4 animate-pulse',
          `grid-cols-${columns} grid-rows-${rows}`,
        )}
      >
        {Array.from({ length: rows * columns }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'rounded-lg bg-muted',
              aspectRatio ? `aspect-${aspectRatio}` : 'h-24',
              fullWidth && 'w-full',
            )}
          />
        ))}
      </div>
    );

    // Generate form skeleton
    const renderFormSkeleton = () => (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="space-y-2">
          <div className={cn('h-3 w-1/4 rounded-md bg-muted')} />
          <div className={cn('h-10 w-full rounded-md bg-muted')} />
        </div>
        <div className="space-y-2">
          <div className={cn('h-3 w-1/3 rounded-md bg-muted')} />
          <div className={cn('h-10 w-full rounded-md bg-muted')} />
        </div>
        <div className="space-y-2">
          <div className={cn('h-3 w-1/4 rounded-md bg-muted')} />
          <div className={cn('h-24 w-full rounded-md bg-muted')} />
        </div>
        <div className="flex justify-end">
          <div className={cn('h-10 w-24 rounded-md bg-muted')} />
        </div>
      </div>
    );

    // Generate text skeleton
    const renderTextSkeleton = () => (
      <div className={cn('animate-pulse space-y-3', className)}>
        <div className={cn('h-6 w-3/4 rounded-md bg-muted')} />
        <div className={cn('h-4 w-full rounded-md bg-muted')} />
        <div className={cn('h-4 w-full rounded-md bg-muted')} />
        <div className={cn('h-4 w-2/3 rounded-md bg-muted')} />
      </div>
    );

    // Generate avatar skeleton
    const renderAvatarSkeleton = () => (
      <div className={cn('animate-pulse flex items-center gap-4', className)}>
        <div className={cn('rounded-full bg-muted', sizeClasses.avatarSize)} />
        <div className="space-y-2">
          <div className={cn('h-3 w-32 rounded-md bg-muted')} />
          <div className={cn('h-2 w-24 rounded-md bg-muted')} />
        </div>
      </div>
    );

    // Generate button skeleton
    const renderButtonSkeleton = () => (
      <div className={cn('animate-pulse rounded-md bg-muted', className)}>
        <div className={cn('h-3 w-1/4 rounded-md bg-muted')} />
        <div className={cn('h-3 w-1/4 rounded-md bg-muted')} />
      </div>
    );

    // Generate circle skeleton
    const renderCircleSkeleton = () => (
      <div className={cn('animate-pulse size-icon rounded-full bg-muted', className)} />
    );

    // Main render function based on variant
    const renderSkeleton = () => {
      switch (variant) {
        case 'card':
          return (
            <div
              className={cn(
                'flex flex-wrap',
                sizeClasses.gap,
                centerItems && 'justify-center items-center',
              )}
            >
              {Array.from({ length: count }).map((_, index) => renderCardSkeleton(index))}
            </div>
          );
        case 'list':
          return (
            <div className={cn('flex flex-col', sizeClasses.gap)}>
              {Array.from({ length: count }).map((_, index) => renderListSkeleton(index))}
            </div>
          );
        case 'grid':
          return renderGridSkeleton();
        case 'form':
          return renderFormSkeleton();
        case 'text':
          return renderTextSkeleton();
        case 'avatar':
          return renderAvatarSkeleton();
        case 'button':
          return renderButtonSkeleton();
        case 'circle':
          return renderCircleSkeleton();
        default:
          return null;
      }
    };

    return (
      <div ref={ref} className={cn(fullWidth && 'w-full')} {...props}>
        {renderSkeleton()}
      </div>
    );
  },
);
LoadingSkeleton.displayName = 'LoadingSkeleton';

export { LoadingSkeleton };
