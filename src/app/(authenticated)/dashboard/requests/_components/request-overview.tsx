'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, Calendar, ClipboardList } from 'lucide-react';
import { ROUTES } from '@/schemas/routes';
import { useDateLocale } from '@/lib/utils';
import { hasAnyRole } from '@/lib/permissions/utils';
import { Timeline } from '@/components/ui/timeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import CardContainer from '@/components/layouts/card-container';
import { RequestQuickEditFormDialog } from './request-quick-edit-form-dialog';
import { Separator } from '@/components/ui/separator';
import { CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import type { Doc } from '@/convex/_generated/dataModel';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserRole, ActivityType } from '@/convex/lib/constants';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface RequestOverviewProps {
  request: NonNullable<Doc<'requests'>>;
}

export function RequestOverview({ request }: RequestOverviewProps) {
  const { user } = useCurrentUser();
  const t = useTranslations();
  const { formatDate } = useDateLocale();

  // Fetch service data
  const service = useQuery(api.functions.service.getService, {
    serviceId: request.serviceId,
  });

  const isAdmin = hasAnyRole(user, [UserRole.Admin, UserRole.Manager]);

  const getActionButton = () => {
    const isSubmitted = request.status === 'submitted';
    const label = isSubmitted
      ? t('requests.actions.start_processing')
      : t('requests.actions.continue_processing');

    return (
      <Button asChild>
        <Link href={ROUTES.dashboard.service_request_review(request._id)}>
          <FileText className="size-4" />
          {label}
        </Link>
      </Button>
    );
  };

  // Get assignee info from metadata
  const assigneeName = request.metadata.assignee
    ? `${request.metadata.assignee.firstName} ${request.metadata.assignee.lastName}`
    : null;

  const lastAction =
    request?.metadata?.activities?.[request?.metadata?.activities?.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('requests.view.title')}</h1>
        {getActionButton()}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="col-span-full space-y-6 md:col-span-8">
          <CardContainer title={t('requests.view.request_info')} contentClass="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={request.status === 'submitted' ? 'outline' : 'default'}>
                  {t(`inputs.requestStatus.options.${request.status}`)}
                </Badge>
                <Badge
                  variant={request.priority === 'urgent' ? 'destructive' : 'outline'}
                >
                  {t(`inputs.priority.options.${request.priority}`)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {t('requests.view.submitted_at')}:{' '}
                {request.submittedAt
                  ? formatDate(new Date(request.submittedAt), 'PPP')
                  : '-'}
              </div>
              {assigneeName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  {t('requests.view.assigned_to')}: {assigneeName}
                </div>
              )}
              {lastAction && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {t('requests.view.last_action')}:{' '}
                  {formatDate(new Date(lastAction.timestamp), 'PPP')}
                </div>
              )}
            </div>
          </CardContainer>
          <CardContainer
            title={t('requests.view.requester_info')}
            contentClass="space-y-2"
          >
            <h3 className="font-medium">
              {request.metadata.profile?.firstName} {request.metadata.profile?.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {request.metadata.profile?.email}
            </p>

            <div className="flex gap-4 flex-col md:w-max">
              {request.profileId && (
                <ProfileLookupSheet
                  profileId={request.profileId as any}
                  triggerLabel="Voir le profil"
                />
              )}
              {request.requesterId !== request.profileId && (
                <div className="flex gap-2 flex-col">
                  <p>
                    <span className="font-medium">Demande effectuée par :</span>{' '}
                    {request.metadata.requester?.firstName}{' '}
                    {request.metadata.requester?.lastName}
                  </p>
                  <ProfileLookupSheet
                    profileId={request.requesterId}
                    triggerLabel={'Voir le profil du demandeur'}
                  />
                </div>
              )}
            </div>
          </CardContainer>
        </div>
        <CardContainer
          className="col-span-full md:col-span-4"
          contentClass="flex flex-col gap-4"
        >
          {/* Change or set assigned agent */}
          {isAdmin && (
            <div className="space-y-4">
              <h4 className="font-medium">
                {t('requests.view.actions.edit_assigned_agent')}
              </h4>
              {assigneeName && (
                <p className="text-sm text-muted-foreground">{assigneeName}</p>
              )}
              <RequestQuickEditFormDialog request={request} />
              <Separator className="my-4" />
            </div>
          )}
          {/* Service Info */}
          <div className="space-y-4">
            <CardTitle className="text-xl">{t('requests.view.service_info')}</CardTitle>
            <div>
              <h4 className="font-medium">{request.metadata.service?.name}</h4>
              <p className="text-sm text-muted-foreground">{service?.description}</p>
            </div>
            <Badge variant="outline">
              {request.metadata.service?.category &&
                t(`inputs.serviceCategory.options.${request.metadata.service.category}`)}
            </Badge>
            <Separator className="my-4" />
          </div>

          {/* Action History */}
          <div className="flex-grow">
            <h4 className="font-medium mb-3">{t('requests.view.history')}</h4>
            <ScrollArea className="h-full pr-4">
              <Timeline>
                {request.metadata.activities
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((activity, index) => (
                    <Timeline.Item
                      key={index}
                      icon={<ClipboardList className="size-4" />}
                      time={formatDate(new Date(activity.timestamp), 'Pp')}
                      title={getActivityTitle(activity.type)}
                      description={getActivityDescription(activity)}
                    />
                  ))}
              </Timeline>
            </ScrollArea>
          </div>
        </CardContainer>
      </div>
    </div>
  );
}

// Helper function to get activity title
function getActivityTitle(type: string): string {
  const activityTypeMap: Record<string, string> = {
    [ActivityType.RequestCreated]: 'Demande créée',
    [ActivityType.RequestSubmitted]: 'Demande soumise',
    [ActivityType.RequestAssigned]: 'Demande assignée',
    [ActivityType.StatusChanged]: 'Statut modifié',
    [ActivityType.DocumentUploaded]: 'Document ajouté',
    [ActivityType.CommentAdded]: 'Commentaire ajouté',
    [ActivityType.RequestCompleted]: 'Demande terminée',
  };
  return activityTypeMap[type] || type;
}

// Helper function to get activity description
function getActivityDescription(activity: { type: string; data?: Record<string, unknown> }): string {
  if (activity.type === ActivityType.StatusChanged) {
    return `De ${activity.data?.from || '-'} à ${activity.data?.to || '-'}`;
  }
  if (activity.type === ActivityType.RequestAssigned) {
    const assignee = activity.data?.assignee as { firstName?: string; lastName?: string } | undefined;
    if (assignee && assignee.firstName && assignee.lastName) {
      return `Assigné à ${assignee.firstName} ${assignee.lastName}`;
    }
  }
  return '-';
}
