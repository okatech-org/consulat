import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ListingSkeleton() {
  return (
    <div className="container space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Skeleton className="h-10 w-1/2" /> {/* Titre */}
          <Button size="icon" leftIcon={<Plus className="size-4" />} />
        </CardHeader>

        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 py-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-2/3 max-w-[300px]" />
                <Skeleton className="h-6 w-1/4 max-w-[120px]" />
              </div>
              <div className="flex w-full items-center gap-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[40px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
