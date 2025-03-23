'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[300px]" />
          <LoadingSkeleton variant="text" className="h-4 max-w-[400px]" />
        </div>

        {/* Tabs structure */}
        <Tabs defaultValue="general">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="general">
              <LoadingSkeleton className="h-4 w-24" />
            </TabsTrigger>
            <TabsTrigger value="profile">
              <LoadingSkeleton className="h-4 w-24" />
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <LoadingSkeleton className="h-4 w-32" />
            </TabsTrigger>
            <TabsTrigger value="security">
              <LoadingSkeleton className="h-4 w-24" />
            </TabsTrigger>
          </TabsList>

          {/* General settings tab content */}
          <TabsContent value="general" className="space-y-6">
            {/* Profile section */}
            <Card>
              <CardHeader>
                <LoadingSkeleton variant="text" className="h-6 max-w-[180px]" />
                <LoadingSkeleton variant="text" className="h-4 max-w-[300px]" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <LoadingSkeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <LoadingSkeleton variant="text" className="h-5 w-40" />
                    <LoadingSkeleton variant="text" className="h-4 w-64" />
                    <LoadingSkeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account settings */}
            <Card>
              <CardHeader>
                <LoadingSkeleton variant="text" className="h-6 max-w-[180px]" />
                <LoadingSkeleton variant="text" className="h-4 max-w-[300px]" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <LoadingSkeleton variant="text" className="h-4 w-32" />
                      <LoadingSkeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notification settings */}
            <Card>
              <CardHeader>
                <LoadingSkeleton variant="text" className="h-6 max-w-[230px]" />
                <LoadingSkeleton variant="text" className="h-4 max-w-[350px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <LoadingSkeleton variant="text" className="h-5 w-36" />
                        <LoadingSkeleton variant="text" className="h-4 w-64" />
                      </div>
                      <LoadingSkeleton className="h-6 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end">
              <LoadingSkeleton className="h-10 w-32" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
