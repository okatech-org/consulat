'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import CardContainer from '@/components/layouts/card-container';
import { useUserServiceRequests } from '@/hooks/use-services';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Eye, Download, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function RequestsHistory() {
  const { requests, isLoading, error } = useUserServiceRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const t = useTranslations('dashboard.history');

  const statusOptions = [
    { value: 'all', label: t('statuses.all') },
    { value: 'PROCESSING', label: t('statuses.processing') },
    { value: 'COMPLETED', label: t('statuses.completed') },
    { value: 'SUBMITTED', label: t('statuses.submitted') },
    { value: 'DRAFT', label: t('statuses.draft') },
  ];

  // Filtrer les demandes
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests.filter((request) => {
      const matchesSearch =
        request.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      COMPLETED: { label: t('labels.completed'), color: 'bg-green-100 text-green-800' },
      PROCESSING: { label: t('labels.processing'), color: 'bg-amber-100 text-amber-800' },
      VALIDATED: { label: t('labels.validated'), color: 'bg-blue-100 text-blue-800' },
      SUBMITTED: { label: t('labels.submitted'), color: 'bg-gray-100 text-gray-800' },
      DRAFT: { label: t('labels.draft'), color: 'bg-gray-50 text-gray-600' },
      REJECTED: { label: t('labels.rejected'), color: 'bg-red-100 text-red-800' },
      CANCELLED: { label: t('labels.cancelled'), color: 'bg-red-100 text-red-800' },
      PENDING: { label: t('labels.pending'), color: 'bg-yellow-100 text-yellow-800' },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        color: 'bg-gray-100 text-gray-800',
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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <CardContainer key={i}>
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mb-4" />
            <div className="h-2 bg-muted rounded w-full" />
          </CardContainer>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <CardContainer>
        <div className="text-center">
          <p className="text-destructive mb-4">
            {t('error.loading')}
          </p>
          <Button variant="outline">{t('error.retry')}</Button>
        </div>
      </CardContainer>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <CardContainer>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <MultiSelect
              type="single"
              options={statusOptions}
              selected={statusFilter}
              onChange={setStatusFilter}
              placeholder={t('status_placeholder')}
            />
          </div>
        </div>
      </CardContainer>

      {/* Liste des demandes */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const statusInfo = getStatusBadge(request.status);
            const progress = getProgress(request.status);

            return (
              <CardContainer
                key={request.id}
                className="hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{request.service.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        {t('submitted_ago')}{' '}
                        {formatDistanceToNow(new Date(request.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      <span>{t('id_label')}: #{request.id.slice(-8)}</span>
                    </div>
                  </div>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <Link href={ROUTES.user.service_request_details(request.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('actions.view_details')}
                    </Link>
                  </Button>

                  {request.status === 'COMPLETED' && (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t('actions.download')}
                    </Button>
                  )}

                  {['PROCESSING', 'VALIDATED', 'SUBMITTED'].includes(request.status) && (
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t('actions.contact_agent')}
                    </Button>
                  )}
                </div>
              </CardContainer>
            );
          })}
        </div>
      ) : (
        <CardContainer>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || statusFilter !== 'all'
                ? t('empty.no_results')
                : t('empty.no_requests')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? t('empty.no_results_description')
                : t('empty.no_requests_description')}
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                {t('empty.reset_filters')}
              </Button>
            ) : (
              <Button asChild>
                <Link href={ROUTES.user.service_available}>
                  {t('empty.first_request')}
                </Link>
              </Button>
            )}
          </div>
        </CardContainer>
      )}
    </div>
  );
}
