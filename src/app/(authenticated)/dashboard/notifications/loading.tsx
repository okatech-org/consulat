'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';

export default function NotificationsLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[300px]" />
          <LoadingSkeleton variant="text" className="h-4 max-w-[400px]" />
        </div>

        {/* Notifications list */}
        <div className="divide-y border rounded-md">
          {Array.from({ length: 8 }).map((_, i) => (
            <NotificationItemSkeleton key={i} />
          ))}
        </div>

        {/* Mark all as read button */}
        <div className="flex justify-end px-4">
          <LoadingSkeleton className="h-9 w-32" />
        </div>
      </div>
    </PageContainer>
  );
}

// Skeleton for an individual notification item
function NotificationItemSkeleton() {
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <LoadingSkeleton variant="text" className="h-5 w-3/4 mb-2" />
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-4 w-full" />
            <LoadingSkeleton variant="text" className="h-4 w-4/5" />
          </div>
          <LoadingSkeleton variant="text" className="h-3 w-32 mt-2" />
        </div>
        <LoadingSkeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
