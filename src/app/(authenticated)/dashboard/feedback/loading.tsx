'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';

export default function FeedbackLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[300px]" />
          <LoadingSkeleton variant="text" className="h-4 max-w-[400px]" />
        </div>

        {/* Feedback form skeleton */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="space-y-6">
            {/* Category field */}
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="h-4 w-32" />
              <LoadingSkeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Subject field */}
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="h-4 w-24" />
              <LoadingSkeleton className="h-10 w-full rounded-md" />
            </div>

            {/* Message field */}
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="h-4 w-28" />
              <LoadingSkeleton className="h-32 w-full rounded-md" />
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <LoadingSkeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
