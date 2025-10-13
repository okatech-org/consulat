'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';
import CardContainer from '@/components/layouts/card-container';
import type { RequestStatus } from '@prisma/client';
import { useQuery } from 'convex/react';
import { api as convexApi } from 'convex/_generated/api';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';

export function RecentHistory() {
  const { user } = useCurrentUser();
  const requests = useQuery(
    convexApi.functions.request.getRecentRequests,
    user
      ? {
          limit: 5,
          userId: user._id,
        }
      : 'skip',
  );
  const isLoading = requests === undefined;
  const t = useTranslations('dashboard.unified.recent_history');
  const tStatus = useTranslations('dashboard.unified.current_request.status');

  const getStatusBadge = (status: RequestStatus) => {
    const statusMap: Record<
      RequestStatus,
      { label: string; variant: 'default' | 'secondary' | 'outline'; color: string }
    > = {
      COMPLETED: {
        label: tStatus('completed'),
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800',
      },
      VALIDATED: {
        label: tStatus('validated'),
        variant: 'outline' as const,
        color: 'bg-blue-100 text-blue-800',
      },
      SUBMITTED: {
        label: tStatus('submitted'),
        variant: 'outline' as const,
        color: 'bg-gray-100 text-gray-800',
      },
      PENDING: {
        label: tStatus('pending'),
        variant: 'outline' as const,
        color: 'bg-yellow-100 text-yellow-800',
      },
      REJECTED: {
        label: tStatus('rejected'),
        variant: 'outline' as const,
        color: 'bg-red-100 text-red-800',
      },
      DRAFT: {
        label: tStatus('draft'),
        variant: 'outline' as const,
        color: 'bg-gray-100 text-gray-800',
      },
      EDITED: {
        label: tStatus('edited'),
        variant: 'outline',
        color: 'bg-gray-100 text-gray-800',
      },
      PENDING_COMPLETION: {
        label: tStatus('pending_completion'),
        variant: 'outline',
        color: 'bg-gray-100 text-gray-800',
      },
      CARD_IN_PRODUCTION: {
        label: tStatus('card_in_production'),
        variant: 'outline',
        color: 'bg-gray-100 text-gray-800',
      },
      DOCUMENT_IN_PRODUCTION: {
        label: tStatus('document_in_production'),
        variant: 'outline',
        color: 'bg-gray-100 text-gray-800',
      },
      READY_FOR_PICKUP: {
        label: tStatus('ready_for_pickup'),
        variant: 'outline',
        color: 'bg-gray-100 text-gray-800',
      },
      APPOINTMENT_SCHEDULED: {
        label: tStatus('appointment_scheduled'),
        variant: 'outline',
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

  if (isLoading) {
    return (
      <CardContainer title={t('title')} subtitle={t('subtitle')}>
        <LoadingSkeleton variant="list" rows={3} className="!w-full" />
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title={t('title')}
      subtitle={t('subtitle')}
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.requests}>
            {t('view_all')}
            <ArrowRight className="size-icon" />
          </Link>
        </Button>
      }
    >
      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => {
            const statusInfo = getStatusBadge(request.status as RequestStatus);
            return (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{request.service?.name}</h4>
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
          <h4 className="font-medium mb-2">{t('no_history')}</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {t('no_history_description')}
          </p>
          <Button size="sm" asChild>
            <Link href={ROUTES.user.services}>{t('make_first_request')}</Link>
          </Button>
        </div>
      )}
    </CardContainer>
  );
}
