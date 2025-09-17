import { getTranslations } from 'next-intl/server';
import { StatsCard } from '@/components/ui/stats-card';
import { getCurrentUser } from '@/lib/auth/utils';
import { getServiceRequestsByUser } from '@/actions/service-requests';
import { format } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserAppointments } from '@/actions/appointments';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';

export default async function AgentDashboard() {
  const t = await getTranslations('agent.dashboard');
  const t_common = await getTranslations('common');

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Fetch agent's assigned requests
  const assignedRequests = await getServiceRequestsByUser(currentUser.id);

  // Count requests by status
  const pendingRequests = assignedRequests.filter((req) =>
    ['SUBMITTED', 'PENDING', 'PENDING_COMPLETION'].includes(req.status),
  ).length;

  const processingRequests = assignedRequests.filter((req) =>
    [
      'VALIDATED',
      'CARD_IN_PRODUCTION',
      'READY_FOR_PICKUP',
      'APPOINTMENT_SCHEDULED',
    ].includes(req.status),
  ).length;

  const completedRequests = currentUser.completedRequests || 0;

  // Fetch agent's appointments
  const appointmentsResponse = await getUserAppointments({ agentId: currentUser.id });
  const appointments = appointmentsResponse.data || {
    upcoming: [],
    past: [],
    cancelled: [],
  };

  return (
    <PageContainer
      title={t('title')}
      description={t('welcome', {
        name: currentUser.name || '',
      })}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.appointments')}
          value={appointments.upcoming.length}
          description={t('stats.appointments_description')}
          icon={Calendar}
          className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
        />
        <StatsCard
          title={t('stats.requests')}
          value={pendingRequests}
          description={t('stats.requests_description')}
          icon={Clock}
          className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
        />
        <StatsCard
          title={t('stats.processing')}
          value={processingRequests}
          description={t('stats.processing_description')}
          icon={FileText}
          className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-indigo-500 dark:text-indigo-400"
        />
        <StatsCard
          title={t('stats.completed')}
          value={completedRequests}
          description={t('stats.completed_description')}
          icon={CheckCircle}
          className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <CardContainer
          title={t('stats.recent_requests')}
          action={
            <Button variant="ghost" size="mobile" asChild>
              <Link href={ROUTES.dashboard.requests}>{t('actions.see_all')}</Link>
            </Button>
          }
          className="lg:col-span-1"
          footerContent={
            <Button
              variant="outline"
              size="mobile"
              className="w-full"
              rightIcon={<ArrowRight />}
              asChild
            >
              <Link href={ROUTES.dashboard.requests}>
                {t('actions.view_all_requests')}
              </Link>
            </Button>
          }
        >
          {assignedRequests.length > 0 ? (
            <div className="space-y-4">
              {assignedRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-start space-x-3 border-b pb-3 last:border-0"
                >
                  <div className="rounded-md bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{request.service.name}</p>
                      <Badge
                        variant={
                          request.status === 'COMPLETED'
                            ? 'default'
                            : [
                                  'VALIDATED',
                                  'CARD_IN_PRODUCTION',
                                  'READY_FOR_PICKUP',
                                  'APPOINTMENT_SCHEDULED',
                                ].includes(request.status)
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {t_common(`status.${request.status}`)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">{t('stats.no_requests')}</p>
            </div>
          )}
        </CardContainer>

        {/* Upcoming Appointments */}
        <CardContainer
          title={t('stats.upcoming_appointments')}
          action={
            <Button variant="ghost" size="mobile" asChild>
              <Link href={ROUTES.dashboard.appointments}>{t('actions.see_all')}</Link>
            </Button>
          }
          className="lg:col-span-1"
          footerContent={
            <Button
              variant="outline"
              size="mobile"
              className="w-full"
              rightIcon={<ArrowRight />}
              asChild
            >
              <Link href={ROUTES.dashboard.appointments}>
                {t('actions.view_all_appointments')}
              </Link>
            </Button>
          }
        >
          {appointments.upcoming.length > 0 ? (
            <div className="space-y-4">
              {appointments.upcoming.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start space-x-3 border-b pb-3 last:border-0"
                >
                  <div className="rounded-md bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {appointment.request?.service?.name || t('appointments.title')}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {format(new Date(appointment.date), 'dd MMM yyyy')} -{' '}
                        {format(new Date(appointment.startTime), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">{t('stats.no_appointments')}</p>
            </div>
          )}
        </CardContainer>
      </div>
    </PageContainer>
  );
}
