'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { Doc } from '@/convex/_generated/dataModel';

export function RequestsHistory({ requests }: { requests?: Doc<'requests'>[] }) {
  const { formatDate } = useDateLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const t = useTranslations('dashboard.history');

  // Filtrer les demandes
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter((request) => {
      const matchesSearch =
        request.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      COMPLETED: { label: t('labels.completed'), variant: 'default' as const },
      PROCESSING: { label: t('labels.processing'), variant: 'secondary' as const },
      VALIDATED: { label: t('labels.validated'), variant: 'secondary' as const },
      SUBMITTED: { label: t('labels.submitted'), variant: 'outline' as const },
      DRAFT: { label: t('labels.draft'), variant: 'outline' as const },
      REJECTED: { label: t('labels.rejected'), variant: 'destructive' as const },
      CANCELLED: { label: t('labels.cancelled'), variant: 'destructive' as const },
      PENDING: { label: t('labels.pending'), variant: 'secondary' as const },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: 'outline' as const,
      }
    );
  };

  const getProgress = (status: string) => {
    const progressMap = {
      DRAFT: 0,
      SUBMITTED: 25,
      VALIDATED: 50,
      PROCESSING: 75,
      COMPLETED: 100,
      REJECTED: 100,
      CANCELLED: 100,
      PENDING: 0,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  if (!requests) {
    return <LoadingSkeleton variant="grid" rows={3} className="!w-full" />;
  }

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statuses.all')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statuses.all')}</SelectItem>
            <SelectItem value="submitted">{t('statuses.submitted')}</SelectItem>
            <SelectItem value="under_review">{t('statuses.processing')}</SelectItem>
            <SelectItem value="validated">{t('statuses.completed')}</SelectItem>
            <SelectItem value="rejected">{t('statuses.pending')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des demandes */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const statusInfo = getStatusBadge(request.status);
            const progress = getProgress(request.status);

            return (
              <Card key={request._id} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold">Demande #{request.number}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                        <span>Soumise le {formatDate(new Date(request._creationTime))}</span>
                        <span>ID: {request.number}</span>
                      </div>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <div className="mb-4">
                    <Progress value={progress} className="h-1" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" asChild>
                      <Link href={ROUTES.user.service_request_details(request._id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Link>
                    </Button>
                    {request.status === 'completed' && (
                      <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed border-muted">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-4 bg-card rounded-full w-fit mx-auto border border-muted">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucune demande trouvée'
                  : 'Aucune demande'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Aucune demande ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  : 'Vous n&apos;avez pas encore fait de demande de service consulaire.'}
              </p>
            </div>
            {searchTerm || statusFilter !== 'all' ? (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href={ROUTES.user.services}>Faire ma première demande</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
