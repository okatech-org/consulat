'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';

export default function AvailableServicesLoading() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-8 w-64" />
            <LoadingSkeleton variant="text" className="h-4 w-96" />
          </div>
          <LoadingSkeleton className="h-10 w-32" />
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <LoadingSkeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-10 w-32" />
            <LoadingSkeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Service cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
                <LoadingSkeleton variant="text" className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <LoadingSkeleton variant="text" className="h-4 w-full mb-4" />
                <LoadingSkeleton variant="text" className="h-4 w-5/6 mb-4" />
                <LoadingSkeleton variant="text" className="h-4 w-4/5 mb-4" />

                <div className="flex flex-wrap gap-2 mt-4">
                  <LoadingSkeleton className="h-6 w-16 rounded-full" />
                  <LoadingSkeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4 border-t">
                <LoadingSkeleton className="h-5 w-24" />
                <LoadingSkeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-10 w-10 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
