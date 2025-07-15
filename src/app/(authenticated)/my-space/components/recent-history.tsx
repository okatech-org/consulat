'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

interface RecentHistoryProps {
  requests: Array<{
    id: string;
    status: string;
    createdAt: string;
    service: { name: string };
  }>;
}

export function RecentHistory({ requests }: RecentHistoryProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      COMPLETED: {
        label: 'Terminée',
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800',
      },
      PROCESSING: {
        label: 'En traitement',
        variant: 'secondary' as const,
        color: 'bg-amber-100 text-amber-800',
      },
      VALIDATED: {
        label: 'Validée',
        variant: 'outline' as const,
        color: 'bg-blue-100 text-blue-800',
      },
      SUBMITTED: {
        label: 'Soumise',
        variant: 'outline' as const,
        color: 'bg-gray-100 text-gray-800',
      },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: 'outline' as const,
        color: 'bg-gray-100 text-gray-800',
      }
    );
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Historique récent</h3>
          <p className="text-muted-foreground text-sm">Vos dernières demandes</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.requests}>
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusBadge(request.status);
            return (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{request.service.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(request.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${statusInfo.color}`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium mb-2">Aucun historique</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Vous n&apos;avez pas encore de demandes dans votre historique.
          </p>
          <Button size="sm" asChild>
            @<Link href={ROUTES.user.services}>Faire ma première demande</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
