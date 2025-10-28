'use client';

import { StatsCard } from '@/components/ui/stats-card';
import { format } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layouts/page-container';
import { LeafletDashboardWrapper } from '@/components/dashboards/leaflet-dashboard-wrapper';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import CardContainer from '../layouts/card-container';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useDashboard } from '@/hooks/use-dashboard';
import type { AdminStats } from '@/server/api/routers/dashboard/types';

export default function AdminDashboard() {
  const { data: adminStats } = useDashboard<AdminStats>();
  const { user } = useCurrentUser();
  const profilesGeographicData = useQuery(
    api.functions.intelligence.getProfilesMap,
    user.organizationId ? {} : 'skip',
  );
  const t = useTranslations('admin.dashboard');
  const t_appointments = useTranslations('admin.appointments');

  return (
    <PageContainer
      title={t('title')}
      description={`${t('welcome', {
        name: user.name || '',
      })} ${t('subtitle')}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.completed_requests')}
          value={adminStats?.stats.completedRequests}
          description={t('stats.active_profiles', {
            count: adminStats?.stats.completedRequests,
          })}
          icon={CheckCircle}
          className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={adminStats?.stats.processingRequests}
          description={t('stats.processing_requests', {
            count: adminStats?.stats.processingRequests,
          })}
          icon={Clock}
          className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
        />
        <StatsCard
          title={t('stats.pending_requests')}
          value={adminStats?.stats.pendingRequests}
          description={t('stats.pending_requests', {
            count: adminStats?.stats.pendingRequests,
          })}
          icon={FileText}
          className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
        />
        <StatsCard
          title={t('stats.total_profiles')}
          value={adminStats?.stats.totalProfiles}
          description={t('stats.total_profiles', {
            count: adminStats?.stats.totalProfiles,
          })}
          icon={Users}
          className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
          iconClassName="bg-white dark:bg-neutral-900 text-indigo-500 dark:text-indigo-400"
        />
      </div>
      {/* Geographic Distribution Map */}
      <CardContainer title="Répartition géographique" className="mb-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Visualisation des concentrations de profils par ville
          </p>
        </div>
        <LeafletDashboardWrapper data={profilesGeographicData || []} height="600px" />
      </CardContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <CardContainer
          title={t_appointments('upcoming')}
          action={
            <Button variant="ghost" size="mobile" asChild>
              <Link href={ROUTES.dashboard.appointments}>{t('tasks.view_all')}</Link>
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
              <Link href={ROUTES.dashboard.appointments}>{t('tasks.view_all')}</Link>
            </Button>
          }
        >
          {adminStats?.recentData?.upcomingAppointments &&
          adminStats.recentData.upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {adminStats.recentData.upcomingAppointments.map((appointment) => (
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
                        {format(new Date(appointment.date), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {appointment.attendee?.name}
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
        </CardContainer>
      </div>
    </PageContainer>
  );
}
