'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, Calendar, MapPin, ClipboardList } from 'lucide-react';
import { FullServiceRequest } from '@/types/service-request';
import { User as PrismaUser, UserRole } from '@prisma/client';
import { ROUTES } from '@/schemas/routes';
import { useDateLocale } from '@/lib/utils';
import { hasAnyRole, hasRole } from '@/lib/permissions/utils';
import { Timeline } from '@/components/ui/timeline';
import { ScrollArea } from '@/components/ui/scroll-area';
import CardContainer from '@/components/layouts/card-container';
import { RequestQuickEditFormDialog } from './request-quick-edit-form-dialog';
import { BaseAgent } from '@/types/organization';
import { useRouter } from 'next/navigation';
import { assignServiceRequest } from '@/actions/service-requests';
import { FullProfile } from '@/types/profile';
import { UserProfile } from '@/components/profile/user-profile';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { CardTitle } from '@/components/ui/card';
interface RequestOverviewProps {
  request: FullServiceRequest & { profile?: FullProfile | null };
  user: PrismaUser;
  agents: BaseAgent[];
}

export function RequestOverview({ request, user, agents = [] }: RequestOverviewProps) {
  const t = useTranslations();
  const { formatDate } = useDateLocale();
  const router = useRouter();

  const isProcessable = !['COMPLETED', 'CANCELLED'].includes(request.status);
  const isAgent = hasRole(user, UserRole.AGENT);
  const isAdmin = hasAnyRole(user, ['ADMIN', 'MANAGER']);

  const getActionButton = () => {
    const isSubmitted = request.status === 'SUBMITTED';
    const label = isSubmitted
      ? t('requests.actions.start_processing')
      : t('requests.actions.continue_processing');

    if (isProcessable && isAgent)
      return (
        <Button
          onClick={async () => {
            await assignServiceRequest(request.id, user.id);
            router.push(ROUTES.dashboard.service_request_review(request.id));
          }}
        >
          <FileText className="size-4" />
          {label}
        </Button>
      );

    return (
      <Button
        disabled={!isProcessable || !isAgent}
        onClick={async () => {
          router.push(ROUTES.dashboard.service_request_review(request.id));
        }}
      >
        <FileText className="size-4" />
        {label}
      </Button>
    );
  };

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
                <Badge variant={request.status === 'SUBMITTED' ? 'outline' : 'default'}>
                  {t(`common.status.${request.status}`)}
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
                {t('requests.view.submitted_at')}:{' '}
                {formatDate(request.submittedAt || request.createdAt, 'PPP')}
              </div>
              {request.assignedTo && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  {t('requests.view.assigned_to')}: {request.assignedTo.firstName}{' '}
                  {request.assignedTo.lastName}
                </div>
              )}
              {request.lastActionAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  {t('requests.view.last_action')}:{' '}
                  {formatDate(request.lastActionAt, 'PPP')}
                </div>
              )}
            </div>
          </CardContainer>
          <CardContainer
            title={t('requests.view.requester_info')}
            contentClass="space-y-2"
          >
            <h3 className="font-medium">
              {request.submittedBy.firstName} {request.submittedBy.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{request.submittedBy.email}</p>

            {request.profile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="size-4" />
                    {t('requests.service_request.view_profile')}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-4xl">
                  <SheetHeader>
                    <SheetTitle>
                      {t('requests.service_request.applicant_profile')}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6">
                    <UserProfile profile={request.profile} />
                  </div>
                </SheetContent>
              </Sheet>
            )}
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
              {request.assignedTo && (
                <p className="text-sm text-muted-foreground">
                  {request.assignedTo.firstName} {request.assignedTo.lastName}
                </p>
              )}
              <RequestQuickEditFormDialog request={request} agents={agents} />
              <Separator className="my-4" />
            </div>
          )}
          {/* Service Info */}
          <div className="space-y-4">
            <CardTitle className="text-xl">{t('requests.view.service_info')}</CardTitle>
            <div>
              <h4 className="font-medium">{request.service.name}</h4>
              <p className="text-sm text-muted-foreground">
                {request.service.description}
              </p>
            </div>
            <Badge variant="outline">
              {t(`common.service_categories.${request.serviceCategory}`)}
            </Badge>
            <Separator className="my-4" />
          </div>

          {/* Appointment Info if exists */}
          {request.appointment && (
            <div className="space-y-4">
              <CardTitle className="text-xl">{t('requests.view.appointment')}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4" />
                  {formatDate(request.appointment.date, 'PPP')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4" />
                  {t('common.duration.in_minutes', {
                    minutes: request.appointment.duration,
                  })}
                </div>
                {request.appointment.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>
                      {`${request.appointment.location.firstLine}, ${request.appointment.location.secondLine}, ${request.appointment.location.zipCode} ${request.appointment.location.city}`}
                    </span>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {/* Action History */}
          <div className="flex-grow">
            <h4 className="font-medium mb-3">{t('requests.view.history')}</h4>
            <ScrollArea className="h-full pr-4">
              <Timeline>
                {request.actions.map((action) => (
                  <Timeline.Item
                    key={action.id}
                    icon={<ClipboardList className="size-4" />}
                    time={formatDate(action.createdAt, 'Pp')}
                    title={t(`common.request.actions.${action.type.toLowerCase()}`)}
                    description={action.data?.agentId}
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
