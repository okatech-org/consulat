'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SuperAdminLoading() {
  return (
    <div className="container space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <LoadingSkeleton variant="text" className="h-8 w-64" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-10 w-10 rounded-md" />
          <LoadingSkeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <LoadingSkeleton variant="text" className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton variant="text" className="h-8 w-16 mb-2" />
              <div className="h-2 w-full">
                <LoadingSkeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main dashboard sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Organizations section */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <LoadingSkeleton variant="text" className="h-6 w-48" />
            <LoadingSkeleton className="h-9 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 p-2 border-b"
                >
                  <div className="flex items-center gap-3">
                    <LoadingSkeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-1">
                      <LoadingSkeleton variant="text" className="h-5 w-40" />
                      <LoadingSkeleton variant="text" className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <LoadingSkeleton className="h-9 w-9 rounded-md" />
                    <LoadingSkeleton className="h-9 w-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics chart */}
        <Card>
          <CardHeader className="pb-2">
            <LoadingSkeleton variant="text" className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="aspect-square">
              <LoadingSkeleton className="h-full w-full rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System status section */}
      <Card>
        <CardHeader className="pb-2">
          <LoadingSkeleton variant="text" className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <LoadingSkeleton variant="text" className="h-5 w-32" />
                  <LoadingSkeleton className="h-4 w-16" />
                </div>
                <LoadingSkeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity log */}
      <Card>
        <CardHeader className="pb-2">
          <LoadingSkeleton variant="text" className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 border-b pb-3">
                <LoadingSkeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <LoadingSkeleton variant="text" className="h-5 w-48" />
                    <LoadingSkeleton variant="text" className="h-4 w-24" />
                  </div>
                  <LoadingSkeleton variant="text" className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
