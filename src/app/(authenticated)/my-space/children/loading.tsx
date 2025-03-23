'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function ChildrenLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with action button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-8 w-48" />
            <LoadingSkeleton variant="text" className="h-4 w-64" />
          </div>
          <LoadingSkeleton className="h-10 w-32" />
        </div>

        {/* Children cards grid */}
        <CardContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ChildProfileCardSkeleton key={i} />
            ))}
          </div>
        </CardContainer>
      </div>
    </PageContainer>
  );
}

// Skeleton for an individual child profile card
function ChildProfileCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border bg-muted">
            <div className="absolute bottom-0 w-full h-3 bg-primary"></div>
          </div>
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-5 w-32" />
            <LoadingSkeleton variant="text" className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <LoadingSkeleton variant="text" className="h-3 w-16" />
              <LoadingSkeleton variant="text" className="h-4 w-24" />
            </div>
            <div className="space-y-1">
              <LoadingSkeleton variant="text" className="h-3 w-16" />
              <LoadingSkeleton variant="text" className="h-4 w-20" />
            </div>
            <div className="space-y-1">
              <LoadingSkeleton variant="text" className="h-3 w-16" />
              <LoadingSkeleton variant="text" className="h-4 w-28" />
            </div>
            <div className="space-y-1">
              <LoadingSkeleton variant="text" className="h-3 w-16" />
              <LoadingSkeleton variant="text" className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <LoadingSkeleton className="h-10 w-full rounded-md" />
        <LoadingSkeleton className="h-10 w-10 rounded-md" />
      </CardFooter>
    </Card>
  );
}
