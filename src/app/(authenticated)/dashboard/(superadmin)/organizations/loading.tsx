'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col space-y-2">
          <LoadingSkeleton variant="text" className="h-8 max-w-[300px]" />
          <LoadingSkeleton variant="text" className="h-4 max-w-[400px]" />
        </div>

        {/* Tabs structure */}
        <Tabs defaultValue="organization">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="organization">
              <LoadingSkeleton className="h-4 w-28" />
            </TabsTrigger>
            <TabsTrigger value="services">
              <LoadingSkeleton className="h-4 w-20" />
            </TabsTrigger>
            <TabsTrigger value="agents">
              <LoadingSkeleton className="h-4 w-16" />
            </TabsTrigger>
            <TabsTrigger value="general">
              <LoadingSkeleton className="h-4 w-20" />
            </TabsTrigger>
          </TabsList>

          {/* Organization settings tab */}
          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
                <LoadingSkeleton variant="text" className="h-4 max-w-[300px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Form tabs */}
                  <div className="border-b">
                    <div className="flex space-x-4">
                      <LoadingSkeleton className="h-10 w-32" />
                      <LoadingSkeleton className="h-10 w-32" />
                      <LoadingSkeleton className="h-10 w-32" />
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <LoadingSkeleton variant="text" className="h-4 w-32" />
                        <LoadingSkeleton className="h-10 w-full rounded-md" />
                      </div>
                    ))}
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end">
                    <LoadingSkeleton className="h-10 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <LoadingSkeleton variant="text" className="h-6 w-48" />
                  <LoadingSkeleton variant="text" className="h-4 w-64" />
                </div>
                <LoadingSkeleton className="h-10 w-32" />
              </CardHeader>
              <CardContent>
                {/* Table header */}
                <div className="border-b mb-4">
                  <div className="grid grid-cols-4 gap-3 p-3 bg-muted/20 rounded-t-md">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <LoadingSkeleton key={i} className="h-5" />
                    ))}
                  </div>
                </div>

                {/* Table rows */}
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3 p-3 border-b">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <LoadingSkeleton key={j} className="h-6" />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
