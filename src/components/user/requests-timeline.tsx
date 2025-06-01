'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Eye,
  Download,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CardContainer from '@/components/layouts/card-container';
import { ROUTES } from '@/schemas/routes';
import { cn } from '@/lib/utils';

interface ServiceRequest {
  id: string;
  service: {
    name: string;
  };
  status: string;
  createdAt: string;
  updatedAt?: string;
  nextAction?: {
    title: string;
    description: string;
    href: string;
    deadline?: string;
  };
}

interface RequestsTimelineProps {
  requests: ServiceRequest[];
  maxVisible?: number;
  className?: string;
}

interface TimelineItemProps {
  request: ServiceRequest;
  isLast?: boolean;
}

function getStatusConfig(status: string) {
  const configs = {
    PENDING: {
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      label: 'En attente',
      description: 'Votre demande est en cours de traitement',
      variant: 'secondary' as const,
    },
    VALIDATED: {
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      label: 'Validée',
      description: 'Demande approuvée et en cours de traitement',
      variant: 'default' as const,
    },
    CARD_IN_PRODUCTION: {
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      label: 'En production',
      description: 'Votre document est en cours de création',
      variant: 'default' as const,
    },
    READY_FOR_PICKUP: {
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      label: 'Prêt à retirer',
      description: 'Votre document est disponible',
      variant: 'default' as const,
    },
    APPOINTMENT_SCHEDULED: {
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      label: 'RDV programmé',
      description: 'Rendez-vous confirmé',
      variant: 'default' as const,
    },
    COMPLETED: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      label: 'Terminé',
      description: 'Demande complètement traitée',
      variant: 'default' as const,
    },
    REJECTED: {
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      label: 'Refusée',
      description: 'Demande refusée - Action requise',
      variant: 'destructive' as const,
    },
  };

  return configs[status as keyof typeof configs] || configs.PENDING;
}

function TimelineItem({ request, isLast = false }: TimelineItemProps) {
  const config = getStatusConfig(request.status);
  const Icon = config.icon;
  const hasNextAction = !!request.nextAction;

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />}

      {/* Status icon */}
      <div
        className={cn(
          'relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2',
          config.bgColor,
          config.borderColor,
        )}
      >
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8 space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {request.service.name}
            </h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
          <Badge variant={config.variant} className="self-start sm:self-center">
            {config.label}
          </Badge>
        </div>

        {/* Timeline info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Créée le {format(new Date(request.createdAt), 'dd MMM yyyy', { locale: fr })}
          </span>
          {request.updatedAt && request.updatedAt !== request.createdAt && (
            <span>
              • Mise à jour le{' '}
              {format(new Date(request.updatedAt), 'dd MMM yyyy', { locale: fr })}
            </span>
          )}
        </div>

        {/* Next action card */}
        {hasNextAction && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-foreground">
                  {request.nextAction!.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {request.nextAction!.description}
                </p>
                {request.nextAction!.deadline && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Échéance:{' '}
                    {format(new Date(request.nextAction!.deadline), 'dd MMM yyyy', {
                      locale: fr,
                    })}
                  </p>
                )}
              </div>
              <Button size="sm" asChild>
                <Link href={request.nextAction!.href}>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={ROUTES.user.service_request_details(request.id)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              <span className="text-xs">Voir détails</span>
            </Link>
          </Button>

          {(request.status === 'COMPLETED' || request.status === 'READY_FOR_PICKUP') && (
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span className="text-xs">Télécharger</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RequestsTimeline({
  requests,
  maxVisible = 5,
  className,
}: RequestsTimelineProps) {
  const visibleRequests = requests.slice(0, maxVisible);
  const hasMore = requests.length > maxVisible;

  if (requests.length === 0) {
    return (
      <CardContainer className={className}>
        <div className="text-center py-8 space-y-3">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="font-medium text-foreground">Aucune demande</h3>
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas encore soumis de demande de service
            </p>
          </div>
          <Button asChild>
            <Link href={ROUTES.user.services}>Découvrir nos services</Link>
          </Button>
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title="Suivi de mes demandes"
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.user.requests} className="flex items-center gap-1">
            <span>Voir tout</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      }
      className={className}
    >
      <div className="space-y-0">
        {visibleRequests.map((request, index) => (
          <TimelineItem
            key={request.id}
            request={request}
            isLast={index === visibleRequests.length - 1 && !hasMore}
          />
        ))}

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href={ROUTES.user.requests}>
                Voir {requests.length - maxVisible} demande
                {requests.length - maxVisible > 1 ? 's' : ''} de plus
              </Link>
            </Button>
          </div>
        )}
      </div>
    </CardContainer>
  );
}
