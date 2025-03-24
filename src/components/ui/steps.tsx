'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, CircleDot } from 'lucide-react';

export interface StepProps {
  label: string;
  description?: string;
  status: 'complete' | 'current' | 'upcoming';
  onClick?: () => void;
}

export interface StepsProps {
  children?: React.ReactNode;
  className?: string;
}

export function Step({ label, description, status, onClick }: StepProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3',
        onClick && status === 'complete' && 'cursor-pointer',
      )}
      onClick={status === 'complete' ? onClick : undefined}
    >
      <div className="flex-shrink-0">
        {status === 'complete' ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-5 w-5" />
          </div>
        ) : status === 'current' ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary">
            <CircleDot className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/20">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/20"></span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-sm font-medium',
            status === 'complete' && 'text-primary',
            status === 'current' && 'text-foreground',
            status === 'upcoming' && 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        {description && (
          <span
            className={cn(
              'text-xs',
              status === 'complete' && 'text-primary/80',
              status === 'current' && 'text-muted-foreground',
              status === 'upcoming' && 'text-muted-foreground/60',
            )}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

export function Steps({ children, className }: StepsProps) {
  // Convert children to array
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn('flex flex-col gap-6 sm:flex-row sm:gap-8', className)}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && (
            <div className="hidden flex-1 border-t border-muted pt-4 sm:block sm:border-l sm:border-t-0 sm:pt-0 sm:pl-8" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
