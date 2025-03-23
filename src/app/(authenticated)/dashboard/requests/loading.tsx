'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';

export default function RequestsLoading() {
  return (
    <PageContainer>
      <CardContainer>
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-col space-y-2">
            <LoadingSkeleton variant="text" className="max-w-md" />
          </div>

          {/* Filters section */}
          <Card>
            <CardHeader className="pb-3">
              <LoadingSkeleton variant="text" className="h-6 max-w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <LoadingSkeleton variant="form" className="h-24" />
                <LoadingSkeleton variant="form" className="h-24" />
                <LoadingSkeleton variant="form" className="h-24" />
              </div>
            </CardContent>
          </Card>

          {/* Table skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
                <LoadingSkeleton variant="text" className="h-10 w-[150px]" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Table header */}
              <div className="border-b mb-4">
                <div className="grid grid-cols-6 gap-3 p-3 bg-muted/20 rounded-t-md">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <LoadingSkeleton key={i} className="h-5" />
                  ))}
                </div>
              </div>

              {/* Table rows */}
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-3 p-3 border-b">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <LoadingSkeleton key={j} className="h-6" />
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <LoadingSkeleton className="h-5 w-[200px]" />
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingSkeleton key={i} className="h-10 w-10 rounded-md" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContainer>
    </PageContainer>
  );
}
