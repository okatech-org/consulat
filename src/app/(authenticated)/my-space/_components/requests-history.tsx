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
import { useUserServiceRequests } from '@/hooks/use-services';
import { Eye, Download, MessageSquare, LoaderIcon } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';

export function RequestsHistory() {
  const { formatDate } = useDateLocale();
  const { requests, isLoading, error } = useUserServiceRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const t = useTranslations('dashboard.history');

  // Filtrer les demandes
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter((request) => {
      const matchesSearch =
        request.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const matchesService =
        serviceFilter === 'all' || request.service.name === serviceFilter;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [requests, searchTerm, statusFilter, serviceFilter]);

  // Options pour les filtres
  const uniqueServices = useMemo(() => {
    if (!requests) return [];
    const services = [...new Set(requests.map((r) => r.service.name))];
    return services.map((service) => ({ value: service, label: service }));
  }, [requests]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoaderIcon className="h-4 w-4 animate-spin" />
          <span>Chargement de l&apos;historique...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">{t('error.loading')}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('error.retry')}
        </Button>
      </div>
    );
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
            <SelectItem value="PROCESSING">{t('statuses.processing')}</SelectItem>
            <SelectItem value="COMPLETED">{t('statuses.completed')}</SelectItem>
            <SelectItem value="SUBMITTED">{t('statuses.submitted')}</SelectItem>
            <SelectItem value="PENDING">{t('statuses.pending')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            {uniqueServices.map((service) => (
              <SelectItem key={service.value} value={service.value}>
                {service.label}
              </SelectItem>
            ))}
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
              <Card key={request.id} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold">{request.service.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                        <span>Soumise le {formatDate(request.createdAt)}</span>
                        {request.assignedTo && (
                          <span>Assignée à: {request.assignedTo.name}</span>
                        )}
                        <span>ID: #{request.id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                  <div className="mb-4">
                    <Progress value={progress} className="h-1" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" asChild>
                      <Link href={ROUTES.user.service_request_details(request.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Link>
                    </Button>
                    {/**
                     * TODO: Add download button when the request is completed
                     */}
                    {request.status === 'COMPLETED' && (
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
                {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all'
                  ? 'Aucune demande trouvée'
                  : 'Aucune demande'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all'
                  ? 'Aucune demande ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                  : 'Vous n&apos;avez pas encore fait de demande de service consulaire.'}
              </p>
            </div>
            {searchTerm || statusFilter !== 'all' || serviceFilter !== 'all' ? (
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setServiceFilter('all');
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
