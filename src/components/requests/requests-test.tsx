'use client';

import { useRequests } from '@/hooks/use-requests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function RequestsTest() {
  const { requests, isLoading, error, updateStatus, refetch } = useRequests({
    page: 1,
    limit: 5,
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive">
            Erreur : {error.message}
            <Button onClick={() => refetch()} className="ml-2">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test des demandes tRPC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test des demandes tRPC ({requests?.total || 0} demandes)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests?.items.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between p-4 border rounded"
            >
              <div>
                <div className="font-medium">
                  {request.requestedFor?.firstName} {request.requestedFor?.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {request.serviceCategory}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{request.status}</Badge>
                <Badge
                  variant={request.priority === 'URGENT' ? 'destructive' : 'secondary'}
                >
                  {request.priority}
                </Badge>
                {request.status === 'SUBMITTED' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      updateStatus({
                        requestId: request.id,
                        status: 'PENDING',
                      })
                    }
                  >
                    Marquer en cours
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <Button onClick={() => refetch()} variant="outline">
            Actualiser
          </Button>
          <div className="text-sm text-muted-foreground">
            Page 1 sur {Math.ceil((requests?.total || 0) / 5)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
