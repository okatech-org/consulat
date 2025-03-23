'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';

export default function ServicesLoading() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-8 w-64" />
            <LoadingSkeleton variant="text" className="h-4 w-96" />
          </div>
          <div className="flex flex-wrap gap-2">
            <LoadingSkeleton className="h-10 w-24" />
            <LoadingSkeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Status cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <LoadingSkeleton variant="text" className="h-5 max-w-[80px]" />
              </CardHeader>
              <CardContent className="pb-2">
                <LoadingSkeleton variant="text" className="h-8 max-w-[60px]" />
              </CardContent>
              <CardFooter>
                <LoadingSkeleton variant="text" className="h-4 w-full max-w-[120px]" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Search and filter section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <LoadingSkeleton className="h-10 flex-1 max-w-md" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-10 w-32" />
            <LoadingSkeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Service requests list */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 flex-1">
                    <LoadingSkeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <LoadingSkeleton variant="text" className="h-6 max-w-[250px]" />
                      <LoadingSkeleton variant="text" className="h-4 max-w-[350px]" />
                      <div className="flex flex-wrap gap-2 mt-2">
                        <LoadingSkeleton className="h-6 w-20 rounded-full" />
                        <LoadingSkeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-4 mt-4 lg:mt-0">
                    <div className="space-y-1 text-right">
                      <LoadingSkeleton variant="text" className="h-5 w-24 ml-auto" />
                      <LoadingSkeleton variant="text" className="h-4 w-32 ml-auto" />
                    </div>
                    <LoadingSkeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
              </CardContent>
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
