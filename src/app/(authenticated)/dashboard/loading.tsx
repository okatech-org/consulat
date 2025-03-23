'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="container space-y-8 py-6">
      {/* Header section */}
      <div className="flex flex-col space-y-2">
        <LoadingSkeleton variant="text" className="max-w-md" />
      </div>

      {/* Dashboard cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <LoadingSkeleton variant="text" className="h-8 max-w-[180px]" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton variant="text" className="h-20" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <LoadingSkeleton variant="text" className="h-8 max-w-[180px]" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton variant="text" className="h-20" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <LoadingSkeleton variant="text" className="h-8 max-w-[180px]" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton variant="text" className="h-20" />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity section */}
      <Card>
        <CardHeader className="pb-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[250px]" />
        </CardHeader>
        <CardContent>
          <LoadingSkeleton variant="list" count={5} fullWidth size="sm" />
        </CardContent>
      </Card>
    </div>
  );
}
