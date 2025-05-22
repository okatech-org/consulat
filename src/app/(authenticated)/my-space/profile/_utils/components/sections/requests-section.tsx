'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceRequest } from '@prisma/client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Calendar, Clock, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CardContainer from '@/components/layouts/card-container';

type RequestsSectionProps = {
  requests: ServiceRequest[];
};

const statusColors = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  PENDING_COMPLETION: 'bg-orange-100 text-orange-800',
  VALIDATED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CARD_IN_PRODUCTION: 'bg-purple-100 text-purple-800',
  DOCUMENT_IN_PRODUCTION: 'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-800',
  APPOINTMENT_SCHEDULED: 'bg-cyan-100 text-cyan-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
} as const;

export function RequestsSection({ requests }: RequestsSectionProps) {
  const t = useTranslations('requests');
  const tServices = useTranslations('services');

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      submitted: t('status.submitted'),
      pending: t('status.pending'),
      pending_completion: t('status.pending_completion'),
      validated: t('status.validated'),
      rejected: t('status.rejected'),
      card_in_production: t('status.card_in_production'),
      document_in_production: t('status.card_in_production'),
      ready_for_pickup: t('status.ready_for_pickup'),
      appointment_scheduled: t('status.appointment_scheduled'),
      completed: t('status.completed'),
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      IDENTITY: tServices('categories.IDENTITY'),
      CIVIL_STATUS: tServices('categories.CIVIL_STATUS'),
      VISA: tServices('categories.VISA'),
      CERTIFICATION: tServices('categories.CERTIFICATION'),
      REGISTRATION: tServices('categories.REGISTRATION'),
      TRANSCRIPT: tServices('categories.TRANSCRIPT'),
      OTHER: tServices('categories.OTHER'),
    };
    return categoryMap[category] || category;
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vous n&apos;avez aucune demande en cours pour ce profil.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Demandes en cours</h3>
        <Badge variant="secondary">{requests.length} demande(s)</Badge>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <CardContainer
            key={request.id}
            className="transition-shadow hover:shadow-md"
            title={
              <div className="flex items-center justify-between gap-2">
                <span className="text-base">
                  {getCategoryLabel(request.serviceCategory)}
                </span>
                <Badge
                  className={
                    statusColors[request.status as keyof typeof statusColors] ||
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
            }
          >
            <div className="space-y-3">
              {/* Informations de base */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {request.submittedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Soumise le{' '}
                      {format(new Date(request.submittedAt), 'dd/MM/yyyy', {
                        locale: fr,
                      })}
                    </span>
                  </div>
                )}
                {request.priority && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{request.priority.toLowerCase()}</span>
                  </div>
                )}
              </div>

              {/* Mode de traitement et de livraison */}
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">
                  {t(`processing_mode.${request.chosenProcessingMode}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`delivery_mode.${request.chosenDeliveryMode}`)}
                </Badge>
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link href={ROUTES.dashboard.service_requests(request.id)}>
                    Voir les détails
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContainer>
        ))}
      </div>
    </div>
  );
}
