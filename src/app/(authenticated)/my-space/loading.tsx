'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';

export default function MySpaceLoading() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="space-y-2">
          <LoadingSkeleton variant="text" className="max-w-lg" />
          <LoadingSkeleton variant="text" className="max-w-md h-4" />
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <LoadingSkeleton variant="text" className="h-5 max-w-[120px]" />
              </CardHeader>
              <CardContent className="pb-2">
                <LoadingSkeleton variant="text" className="h-8 max-w-[80px]" />
              </CardContent>
              <CardFooter>
                <LoadingSkeleton variant="text" className="h-4 max-w-[100px]" />
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Recent activities and appointments */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent activities */}
          <Card>
            <CardHeader className="pb-2">
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton variant="list" count={3} fullWidth />
            </CardContent>
            <CardFooter>
              <LoadingSkeleton variant="text" className="h-10 w-full max-w-[150px]" />
            </CardFooter>
          </Card>

          {/* Upcoming appointments */}
          <Card>
            <CardHeader className="pb-2">
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton variant="list" count={3} fullWidth />
            </CardContent>
            <CardFooter>
              <LoadingSkeleton variant="text" className="h-10 w-full max-w-[150px]" />
            </CardFooter>
          </Card>
        </div>

        {/* Services section */}
        <Card>
          <CardHeader className="pb-2">
            <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingSkeleton key={i} variant="card" fullWidth />
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <LoadingSkeleton variant="text" className="h-10 w-full max-w-[150px]" />
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}
