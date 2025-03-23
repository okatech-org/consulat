'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function DocumentsLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[300px]" />
          <LoadingSkeleton variant="text" className="h-4 max-w-[400px]" />
        </div>

        {/* Documents grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

// Skeleton for an individual document card
function DocumentCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <LoadingSkeleton variant="text" className="h-6 w-40" />
          <LoadingSkeleton className="h-5 w-5 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <LoadingSkeleton className="h-4 w-4" />
            <LoadingSkeleton variant="text" className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <LoadingSkeleton className="h-4 w-4" />
            <LoadingSkeleton variant="text" className="h-4 w-40" />
          </div>
          <div className="flex items-center space-x-2">
            <LoadingSkeleton className="h-4 w-4" />
            <LoadingSkeleton variant="text" className="h-4 w-28" />
          </div>
          <div className="mt-2">
            <LoadingSkeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 pt-2">
        <LoadingSkeleton className="h-9 w-9 rounded-md" />
        <LoadingSkeleton className="h-9 w-9 rounded-md" />
      </CardFooter>
    </Card>
  );
}
