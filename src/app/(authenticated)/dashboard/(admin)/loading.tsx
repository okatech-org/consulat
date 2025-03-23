'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import CardContainer from '@/components/layouts/card-container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminLoading() {
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

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <LoadingSkeleton variant="text" className="h-4 w-24" />
              <LoadingSkeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <LoadingSkeleton variant="text" className="h-8 w-16" />
              </div>
              <LoadingSkeleton variant="text" className="h-4 w-32 mt-1" />
              <div className="mt-4 h-2">
                <LoadingSkeleton className="h-2 w-full rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent requests */}
        <CardContainer>
          <div className="mb-4 flex items-center justify-between">
            <LoadingSkeleton variant="text" className="h-6 w-48" />
            <LoadingSkeleton variant="text" className="h-4 w-24" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b pb-4">
                <LoadingSkeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <LoadingSkeleton variant="text" className="h-5 w-48" />
                  <LoadingSkeleton variant="text" className="h-4 w-32" />
                </div>
                <LoadingSkeleton className="h-8 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </CardContainer>

        {/* Analytics chart */}
        <CardContainer>
          <div className="mb-4">
            <LoadingSkeleton variant="text" className="h-6 w-48" />
          </div>
          <div className="aspect-[4/3]">
            <LoadingSkeleton className="h-full w-full rounded-md" />
          </div>
        </CardContainer>
      </div>

      {/* Recent activity table */}
      <CardContainer>
        <div className="mb-4">
          <LoadingSkeleton variant="text" className="h-6 w-48" />
        </div>
        <div className="overflow-auto">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-3 border-b p-3 bg-muted/20">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-5" />
            ))}
          </div>

          {/* Table rows */}
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-3 p-3 border-b hover:bg-muted/50 transition-colors"
              >
                {Array.from({ length: 4 }).map((_, j) => (
                  <LoadingSkeleton key={j} className="h-6" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContainer>
    </div>
  );
}
