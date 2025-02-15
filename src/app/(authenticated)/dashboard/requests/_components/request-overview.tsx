'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, Calendar } from 'lucide-react';
import { FullServiceRequest } from '@/types/service-request';
import { User as PrismaUser } from '@prisma/client';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useDateLocale } from '@/lib/utils';
import { hasAnyRole } from '@/lib/permissions/utils';

interface RequestOverviewProps {
  request: FullServiceRequest;
  user: PrismaUser;
}

export function RequestOverview({ request, user }: RequestOverviewProps) {
  const t = useTranslations();
  const { formatDate } = useDateLocale();

  const canProcess = hasAnyRole(user, ['ADMIN', 'MANAGER', 'AGENT']);
  const isProcessable = !['COMPLETED', 'CANCELLED'].includes(request.status);

  const getActionButton = () => {
    if (!canProcess || !isProcessable) return null;

    const isSubmitted = request.status === 'SUBMITTED';
    const label = isSubmitted
      ? t('dashboard.requests.actions.start_processing')
      : t('dashboard.requests.actions.continue_processing');

    return (
      <Button asChild>
        <Link href={ROUTES.dashboard.service_request_review(request.id)}>
          <FileText className="mr-2 size-4" />
          {label}
        </Link>
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard.requests.view.title')}</h1>
        {getActionButton()}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.requests.view.request_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={request.status === 'SUBMITTED' ? 'outline' : 'default'}>
                  {t('common.status.' + request.status.toLowerCase())}
                </Badge>
                <Badge
                  variant={request.priority === 'URGENT' ? 'destructive' : 'outline'}
                >
                  {t('common.priority.' + request.priority.toLowerCase())}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {t('dashboard.requests.view.submitted_at')}:{' '}
                {formatDate(request.submittedAt || request.createdAt, 'PPP')}
              </div>
              {request.assignedTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  {t('dashboard.requests.view.assigned_to')}:{' '}
                  {request.assignedTo.firstName} {request.assignedTo.lastName}
                </div>
              )}
              {request.lastActionAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {t('dashboard.requests.view.last_action')}:{' '}
                  {formatDate(request.lastActionAt, 'PPP')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.requests.view.requester_info')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">
                {request.submittedBy.firstName} {request.submittedBy.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{request.submittedBy.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
