'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserAppointmentsLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section with title and action button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-8 w-64" />
            <LoadingSkeleton variant="text" className="h-4 w-80" />
          </div>
          <LoadingSkeleton className="h-10 w-40" />
        </div>

        {/* Tabs structure */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming" className="relative">
              <LoadingSkeleton className="h-4 w-24" />
              <div className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                <LoadingSkeleton className="h-3 w-3" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="past">
              <LoadingSkeleton className="h-4 w-16" />
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              <LoadingSkeleton className="h-4 w-28" />
            </TabsTrigger>
          </TabsList>

          {/* Appointments grid */}
          <TabsContent value="upcoming" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <AppointmentCardSkeleton key={i} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

// Skeleton for an individual appointment card
function AppointmentCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow overflow-hidden">
      {/* Card header with status */}
      <div className="flex justify-between items-center p-6 pb-2">
        <LoadingSkeleton className="h-6 w-28 rounded-full" />
        <LoadingSkeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Card content */}
      <div className="p-6 pt-2 space-y-4">
        {/* Service name */}
        <LoadingSkeleton variant="text" className="h-6 w-full max-w-[200px]" />

        {/* Time and date */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="h-4 w-4 rounded-full" />
            <LoadingSkeleton variant="text" className="h-4 w-40" />
          </div>
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="h-4 w-4 rounded-full" />
            <LoadingSkeleton variant="text" className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <LoadingSkeleton className="h-4 w-4 rounded-full" />
            <LoadingSkeleton variant="text" className="h-4 w-36" />
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <LoadingSkeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
