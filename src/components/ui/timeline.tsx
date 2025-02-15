'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  time?: string;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

function TimelineItem({ icon, title, description, time, className }: TimelineItemProps) {
  return (
    <div className={cn('flex gap-3', className)}>
      <div className="relative flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background">
          {icon}
        </div>
        <div className="absolute bottom-0 top-8 w-px -translate-x-1/2 translate-y-3 bg-border" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{title}</p>
          {time && <time className="text-sm text-muted-foreground">{time}</time>}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

Timeline.Item = TimelineItem;
