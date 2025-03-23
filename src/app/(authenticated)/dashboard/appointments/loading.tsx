'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AppointmentsLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[300px]" />
          <LoadingSkeleton variant="text" className="h-4 max-w-[400px]" />
        </div>

        {/* Tabs structure */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming" className="relative">
              <LoadingSkeleton className="h-4 w-24" />
              <div className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-xs">
                <LoadingSkeleton className="h-3 w-3" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="past" className="relative">
              <LoadingSkeleton className="h-4 w-16" />
              <div className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-xs">
                <LoadingSkeleton className="h-3 w-3" />
              </div>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="relative">
              <LoadingSkeleton className="h-4 w-28" />
              <div className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-xs">
                <LoadingSkeleton className="h-3 w-3" />
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Appointments list content */}
          <TabsContent value="upcoming" className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <AppointmentCardSkeleton key={i} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

// Component for individual appointment card skeleton
function AppointmentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LoadingSkeleton className="h-4 w-4 rounded-full" />
              <LoadingSkeleton variant="text" className="h-5 w-32" />
            </div>
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="h-6 w-48 sm:w-72" />
              <LoadingSkeleton variant="text" className="h-4 w-40 sm:w-64" />
            </div>
            <div className="flex flex-wrap gap-2">
              <LoadingSkeleton className="h-8 w-32 rounded-md" />
              <LoadingSkeleton className="h-8 w-32 rounded-md" />
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4 mt-4 sm:mt-0 sm:items-end">
            <div className="space-y-1">
              <LoadingSkeleton variant="text" className="h-4 w-28 sm:ml-auto" />
              <LoadingSkeleton variant="text" className="h-4 w-36 sm:ml-auto" />
            </div>
            <LoadingSkeleton className="h-10 w-28 sm:ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
