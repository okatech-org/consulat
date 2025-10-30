'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';
import { RequestStatus } from '@/convex/lib/constants';
import { EmptyState } from './empty-state';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useDateLocale } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';

export function CurrentRequestCard() {
  const { formatDate } = useDateLocale();
  const { user } = useCurrentUser();

  const currentRequest = useQuery(
    api.functions.request.getCurrentRequest,
    user?.profileId
      ? {
          profileId: user.profileId,
        }
      : 'skip',
  );

  const isLoading = currentRequest === undefined;
  const t = useTranslations('dashboard.unified.current_request');

  if (isLoading) {
    return <LoadingSkeleton variant="card" className="h-48 !w-full" />;
  }

  if (!currentRequest) return <EmptyState />;

  const getProgress = (status: RequestStatus) => {
    const progressMap: Record<RequestStatus, number> = {
      [RequestStatus.Draft]: 0,
      [RequestStatus.Submitted]: 20,
      [RequestStatus.AppointmentScheduled]: 40,
      [RequestStatus.Validated]: 40,
      [RequestStatus.InProduction]: 60,
      [RequestStatus.Completed]: 100,
      [RequestStatus.Rejected]: 100,
      [RequestStatus.Cancelled]: 100,
      [RequestStatus.Pending]: 10,
      [RequestStatus.PendingCompletion]: 30,
      [RequestStatus.ReadyForPickup]: 95,
      [RequestStatus.Edited]: 50,
      [RequestStatus.UnderReview]: 50,
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const getSteps = () => [
    {
      label: t('steps.request_submitted'),
      completed: true,
      date: formatDate(new Date(currentRequest?.submittedAt ?? 0), 'dd/MM/yyyy - HH:mm'),
    },
    {
      label: t('steps.documents_verified'),
      completed: getProgress(currentRequest.status as RequestStatus) >= 40,
      date: 'N/A',
    },
    {
      label: t('steps.processing'),
      current: currentRequest.status === RequestStatus.Pending,
      agent: 'N/A',
    },
    { label: t('steps.final_validation'), completed: false, status: t('steps.waiting') },
    {
      label: t('steps.request_completed'),
      completed: currentRequest.status === RequestStatus.Completed,
      status: t('steps.ready_for_pickup'),
    },
  ];

  return (
    <Card className="overflow-hidden">
      {/* Version desktop */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-primary-foreground p-6 hidden md:block">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">{currentRequest.service?.name}</h2>
            <p className="text-primary-foreground/80 text-sm">
              {t('submitted_ago')}{' '}
              {formatDistanceToNow(new Date(currentRequest?._creationTime ?? ''), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
          <Badge variant="outlineReverse">
            {currentRequest.status === RequestStatus.Pending
              ? t('status.processing')
              : t(`status.${currentRequest.status.toLowerCase()}`)}
          </Badge>
        </div>

        <div className="mb-6">
          <Progress
            value={getProgress(currentRequest.status as RequestStatus)}
            className="h-2 mb-3 bg-primary-foreground/20 text-primary-foreground"
            indicatorClassName="bg-primary-foreground"
          />
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">✓ {t('progress.submitted')}</div>
            <div className="text-center">✓ {t('progress.verified')}</div>
            <div className="text-center font-semibold">
              • {t('progress.in_processing')}
            </div>
            <div className="text-center opacity-70">{t('progress.validation')}</div>
            <div className="text-center opacity-70">{t('progress.completed')}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={ROUTES.user.service_request_details(currentRequest._id)}
            className={buttonVariants({ variant: 'defaultReverse', size: 'default' })}
          >
            <Eye className="size-icon" />
            {t('actions.view_details')}
          </Link>
          <Link
            href={ROUTES.user.contact}
            className={buttonVariants({ variant: 'secondaryReverse', size: 'default' })}
          >
            <MessageSquare className="size-icon" />
            {t('actions.contact_agent')}
          </Link>
        </div>
      </div>

      {/* Version mobile */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 md:hidden">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold mb-1">{currentRequest.service?.name}</h2>
          <p className="text-blue-100 text-xs mb-2">
            {t('submitted_ago')}{' '}
            {formatDistanceToNow(
              new Date(
                currentRequest?.submittedAt ??
                  currentRequest.assignedAt ??
                  currentRequest._creationTime,
              ),
              {
                addSuffix: true,
                locale: fr,
              },
            )}
          </p>
          <Badge variant="outlineReverse">
            {currentRequest.status === RequestStatus.Pending
              ? t('status.processing')
              : t(`status.${currentRequest.status}`)}
          </Badge>
        </div>

        {/* Progression verticale mobile */}
        <div className="space-y-2 mb-4">
          {getSteps().map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                step.completed
                  ? 'bg-green-500/20 border-green-400'
                  : step.current
                    ? 'bg-white/20 border-white'
                    : 'bg-white/5 border-white/30'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : step.current
                      ? 'bg-white text-blue-900'
                      : 'bg-white/30 text-white'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{step.label}</div>
                <div className="text-xs opacity-80">
                  {step.date ||
                    (step.agent
                      ? `${t('steps.by')} ${step.agent}`
                      : step.status || t('steps.waiting'))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Link
            href={ROUTES.user.service_request_details(currentRequest._id)}
            className={
              buttonVariants({ variant: 'defaultReverse', size: 'default' }) + ' w-full'
            }
          >
            <Eye className="size-icon" />
            {t('actions.view_details')}
          </Link>

          <Link
            href={ROUTES.user.contact}
            className={
              buttonVariants({ variant: 'secondaryReverse', size: 'default' }) + ' w-full'
            }
          >
            <MessageSquare className="size-icon" />
            {t('actions.contact_agent')}
          </Link>
        </div>
      </div>
    </Card>
  );
}
