'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';

export default function AppointmentDetailLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Back navigation and title */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <LoadingSkeleton className="h-10 w-10 rounded-md" />
            <LoadingSkeleton variant="text" className="h-5 w-32" />
          </div>
          <LoadingSkeleton variant="text" className="h-8 w-64 mb-2" />
          <LoadingSkeleton variant="text" className="h-4 w-80" />
        </div>

        {/* Status badge */}
        <div className="flex items-center space-x-2">
          <LoadingSkeleton className="h-6 w-32 rounded-full" />
          <LoadingSkeleton className="h-6 w-28 rounded-full" />
        </div>

        {/* Appointment details cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Appointment information */}
          <Card>
            <CardHeader>
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date and time */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <LoadingSkeleton className="h-5 w-5 rounded-full mt-1" />
                  <div className="space-y-1">
                    <LoadingSkeleton variant="text" className="h-5 w-24" />
                    <LoadingSkeleton variant="text" className="h-6 w-40" />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <LoadingSkeleton className="h-5 w-5 rounded-full mt-1" />
                  <div className="space-y-1">
                    <LoadingSkeleton variant="text" className="h-5 w-28" />
                    <LoadingSkeleton variant="text" className="h-6 w-36" />
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <LoadingSkeleton className="h-5 w-5 rounded-full mt-1" />
                  <div className="space-y-1">
                    <LoadingSkeleton variant="text" className="h-5 w-32" />
                    <LoadingSkeleton variant="text" className="h-6 w-48" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column - User information */}
          <Card>
            <CardHeader>
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <LoadingSkeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <LoadingSkeleton variant="text" className="h-6 w-40" />
                  <LoadingSkeleton variant="text" className="h-4 w-32" />
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div className="space-y-1">
                  <LoadingSkeleton variant="text" className="h-4 w-24" />
                  <LoadingSkeleton variant="text" className="h-5 w-48" />
                </div>

                <div className="space-y-1">
                  <LoadingSkeleton variant="text" className="h-4 w-24" />
                  <LoadingSkeleton variant="text" className="h-5 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes section */}
        <Card>
          <CardHeader>
            <LoadingSkeleton variant="text" className="h-6 max-w-[120px]" />
          </CardHeader>
          <CardContent>
            <LoadingSkeleton variant="text" className="h-20 w-full" />
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <LoadingSkeleton className="h-10 w-32" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
      </div>
    </PageContainer>
  );
}
