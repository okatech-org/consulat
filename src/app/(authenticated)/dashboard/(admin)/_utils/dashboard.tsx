import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { getCurrentUser } from '@/actions/user';
import { format } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { db } from '@/lib/prisma';
import { RequestStatus } from '@prisma/client';

export default async function AdminDashboard() {
  const t = await getTranslations('admin.dashboard');
  const t_common = await getTranslations('common');
  const t_registrations = await getTranslations('admin.registrations');
  const t_appointments = await getTranslations('admin.appointments');

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Fetch admin stats
  const [
    completedRequests,
    processingRequests,
    validatedProfiles,
    pendingProfiles,
    recentRegistrations,
    upcomingAppointments,
  ] = await Promise.all([
    db.serviceRequest.count({
      where: { status: RequestStatus.COMPLETED },
    }),
    db.serviceRequest.count({
      where: {
        status: {
          in: [
            RequestStatus.VALIDATED,
            RequestStatus.CARD_IN_PRODUCTION,
            RequestStatus.READY_FOR_PICKUP,
            RequestStatus.APPOINTMENT_SCHEDULED,
          ],
        },
      },
    }),
    db.profile.count({
      where: { status: RequestStatus.COMPLETED },
    }),
    db.profile.count({
      where: {
        status: {
          in: [RequestStatus.SUBMITTED, RequestStatus.PENDING],
        },
      },
    }),
    db.profile.findMany({
      where: {
        status: {
          in: [RequestStatus.SUBMITTED, RequestStatus.PENDING],
        },
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: true,
      },
    }),
    db.appointment.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      take: 5,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        request: {
          include: {
            service: true,
          },
        },
        attendee: true,
      },
    }),
  ]);

  return (
    <PageContainer
      title={t('title')}
      description={t('welcome', {
        name: currentUser.name || '',
      })}
    >
      <CardContainer contentClass="space-y-8">
        {/* Overview Stats */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('subtitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('stats.completed_requests')}
              value={completedRequests}
              description={t('stats.active_profiles', { count: completedRequests })}
              icon={CheckCircle}
              className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
            />
            <StatsCard
              title={t('stats.processing_requests')}
              value={processingRequests}
              description={t('stats.pending_reviews')}
              icon={Clock}
              className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
            />
            <StatsCard
              title={t('stats.validated_profiles')}
              value={validatedProfiles}
              description={t('stats.active_profiles', { count: validatedProfiles })}
              icon={Users}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
            />
            <StatsCard
              title={t('stats.pending_profiles')}
              value={pendingProfiles}
              description={t('stats.pending_reviews')}
              icon={FileText}
              className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-indigo-500 dark:text-indigo-400"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{t('recent_activity')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.dashboard.registrations}>{t('tasks.view_all')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRegistrations.length > 0 ? (
                <div className="space-y-4">
                  {recentRegistrations.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-start space-x-3 border-b pb-3 last:border-0"
                    >
                      <div className="rounded-md bg-primary/10 p-2">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{profile.user?.name}</p>
                          <Badge
                            variant={
                              profile.status === RequestStatus.COMPLETED
                                ? 'success'
                                : profile.status === RequestStatus.PENDING
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {t_common(`status.${profile.status}`)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(profile.updatedAt), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {t_registrations('empty.title')}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.dashboard.registrations}>
                  {t('tasks.view_all')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{t_appointments('upcoming')}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={ROUTES.dashboard.appointments}>{t('tasks.view_all')}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-start space-x-3 border-b pb-3 last:border-0"
                    >
                      <div className="rounded-md bg-primary/10 p-2">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {appointment.request?.service?.name || t_appointments('title')}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>
                            {format(new Date(appointment.date), 'dd MMM yyyy')} -{' '}
                            {format(new Date(appointment.startTime), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {appointment.attendee.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {t_appointments('calendar_placeholder')}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={ROUTES.dashboard.appointments}>
                  {t('tasks.view_all')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </CardContainer>
    </PageContainer>
  );
}
