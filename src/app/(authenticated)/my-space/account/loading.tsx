'use client';

import * as React from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserAccountLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[250px]" />
        </div>

        {/* Tabs structure */}
        <Tabs defaultValue="profile">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile">
              <LoadingSkeleton className="h-4 w-24" />
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <LoadingSkeleton className="h-4 w-32" />
            </TabsTrigger>
          </TabsList>

          {/* Profile tab content */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <LoadingSkeleton variant="text" className="h-6 max-w-[180px]" />
                <LoadingSkeleton variant="text" className="h-4 max-w-[300px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Form fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <LoadingSkeleton variant="text" className="h-4 w-32" />
                        <LoadingSkeleton className="h-10 w-full rounded-md" />
                        <LoadingSkeleton variant="text" className="h-3 w-16" />
                      </div>
                    ))}
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-4">
                    <LoadingSkeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications tab content */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <LoadingSkeleton variant="text" className="h-6 max-w-[180px]" />
                <LoadingSkeleton variant="text" className="h-4 max-w-[300px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <LoadingSkeleton variant="text" className="h-5 w-52" />
                        <LoadingSkeleton variant="text" className="h-4 w-72" />
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
