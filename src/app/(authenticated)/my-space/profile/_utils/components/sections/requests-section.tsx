'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Calendar, Clock, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CardContainer from '@/components/layouts/card-container';
import type { Doc } from '@/convex/_generated/dataModel';
import type { RequestStatus } from '@/convex/lib/constants';
import { useCurrentUser } from '@/hooks/use-current-user';

type RequestsSectionProps = {
  requests: Doc<'requests'>[];
};

const statusColors: Record<RequestStatus, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  pending_completion: 'bg-orange-100 text-orange-800',
  validated: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  in_production: 'bg-purple-100 text-purple-800',
  ready_for_pickup: 'bg-indigo-100 text-indigo-800',
  appointment_scheduled: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  edited: 'bg-gray-100 text-gray-800',
  draft: 'bg-gray-100 text-gray-800',
  under_review: 'bg-yellow-100 text-yellow-800',
} as const;

export function RequestsSection({ requests }: RequestsSectionProps) {
  const t = useTranslations('');
  const { user } = useCurrentUser();

  function canOpenRequest(request: Doc<'requests'>) {
    const membership = user?.membership;
    if (!membership) return false;

    return request.organizationId === membership.organizationId;
  }

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
            key={request._id}
            className="transition-shadow hover:shadow-md"
            title={
              <div className="flex items-center justify-between gap-2">
                <Badge
                  className={
                    statusColors[request.status as keyof typeof statusColors] ||
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {t(`inputs.requestStatus.options.${request.status}`)}
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
                    <span className="capitalize">
                      {t(`inputs.priority.options.${request.priority}`)}
                    </span>
                  </div>
                )}
              </div>

              {/* Mode de traitement et de livraison */}
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">
                  {t(`inputs.processingMode.options.${request.config?.processingMode}`)}
                </Badge>
                <Badge variant="outline">
                  {t(`inputs.deliveryMode.options.${request.config?.deliveryMode}`)}
                </Badge>
              </div>

              {/* Action */}
              <div className="flex flex-col gap-2 justify-end pt-2">
                <Button
                  disabled={!canOpenRequest(request)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <Link href={ROUTES.dashboard.service_requests(request._id)}>
                    Voir les détails
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {!canOpenRequest(request) && (
                  <p className="text-sm text-muted-foreground">
                    Vous n&apos;avez pas les permissions pour ouvrir cette demande.
                  </p>
                )}
              </div>
            </div>
          </CardContainer>
        ))}
      </div>
    </div>
  );
}
