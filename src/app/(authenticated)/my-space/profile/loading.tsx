'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';

export default function ProfileLoading() {
  return (
    <PageContainer>
      <CardContainer>
        <div className="space-y-6">
          {/* Profile header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <LoadingSkeleton variant="text" className="h-8 w-64" />
            <LoadingSkeleton className="h-10 w-40" />
          </div>

          {/* Status alert */}
          <LoadingSkeleton className="h-20 w-full rounded-lg" />

          {/* Profile completion */}
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <LoadingSkeleton variant="text" className="h-6 max-w-[200px]" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex flex-col space-y-4">
                <LoadingSkeleton className="h-6 w-full" />
                <LoadingSkeleton className="h-2 w-full rounded-full" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <LoadingSkeleton className="h-8 w-8 mx-auto rounded-full" />
                      <LoadingSkeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs navigation */}
          <Tabs defaultValue="personal">
            <TabsList className="w-full justify-start overflow-x-auto">
              <LoadingSkeleton className="h-10 w-32 mx-1" />
              <LoadingSkeleton className="h-10 w-32 mx-1" />
              <LoadingSkeleton className="h-10 w-32 mx-1" />
              <LoadingSkeleton className="h-10 w-32 mx-1" />
            </TabsList>

            {/* Tab content - just show a general form skeleton */}
            <TabsContent value="personal" className="mt-6">
              <Card>
                <CardHeader>
                  <LoadingSkeleton variant="text" className="h-6 max-w-[250px]" />
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <LoadingSkeleton variant="text" className="h-4 w-32" />
                        <LoadingSkeleton className="h-10 w-full rounded-md" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <LoadingSkeleton variant="text" className="h-4 w-32" />
                    <LoadingSkeleton className="h-28 w-full rounded-md" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <LoadingSkeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit button section */}
          <div className="flex justify-end space-x-4">
            <LoadingSkeleton className="h-10 w-36" />
          </div>
        </div>
      </CardContainer>
    </PageContainer>
  );
}
