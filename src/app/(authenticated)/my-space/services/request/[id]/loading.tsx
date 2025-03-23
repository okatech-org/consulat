'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';

export default function ServiceRequestDetailLoading() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header and navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <LoadingSkeleton variant="text" className="h-8 w-60 mb-2" />
            <LoadingSkeleton variant="text" className="h-4 w-96" />
          </div>
          <LoadingSkeleton className="h-10 w-28" />
        </div>

        {/* Status badges */}
        <div className="flex items-center flex-wrap gap-3">
          <LoadingSkeleton className="h-6 w-24 rounded-full" />
          <LoadingSkeleton className="h-6 w-32 rounded-full" />
        </div>

        {/* Request timeline/progress */}
        <Card>
          <CardHeader>
            <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress steps */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
                <div className="space-y-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative flex gap-4">
                      <LoadingSkeleton className="h-8 w-8 rounded-full z-10" />
                      <div className="space-y-2 pt-1 flex-1">
                        <LoadingSkeleton variant="text" className="h-5 w-40" />
                        <LoadingSkeleton variant="text" className="h-4 w-28" />
                        <LoadingSkeleton variant="text" className="h-4 w-full max-w-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column - Request information */}
          <Card>
            <CardHeader>
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <LoadingSkeleton variant="text" className="h-4 w-32" />
                    <LoadingSkeleton variant="text" className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right column - Additional information */}
          <Card>
            <CardHeader>
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <LoadingSkeleton variant="text" className="h-4 w-32" />
                    <LoadingSkeleton variant="text" className="h-6 w-full" />
                  </div>
                ))}
              </div>

              {/* Attachments */}
              <div className="mt-6 space-y-2">
                <LoadingSkeleton variant="text" className="h-6 w-36" />
                <div className="flex flex-wrap gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <LoadingSkeleton key={i} className="h-16 w-32 rounded-md" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments/messages section */}
        <Card>
          <CardHeader>
            <LoadingSkeleton variant="text" className="h-6 max-w-[160px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex gap-4">
                    <LoadingSkeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <LoadingSkeleton variant="text" className="h-5 w-36" />
                        <LoadingSkeleton variant="text" className="h-4 w-24" />
                      </div>
                      <LoadingSkeleton variant="text" className="h-16 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <LoadingSkeleton className="h-28 w-full" />
          </CardFooter>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <LoadingSkeleton className="h-10 w-24" />
          <LoadingSkeleton className="h-10 w-24" />
        </div>
      </div>
    </PageContainer>
  );
}
