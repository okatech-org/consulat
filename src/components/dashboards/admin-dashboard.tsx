'use client';

import { StatsCard } from '@/components/ui/stats-card';
import { ArrowRight, CheckCircle, Clock, FileText, Users } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layouts/page-container';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import CardContainer from '../layouts/card-container';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import SmartInteractiveMap from '../intelligence/smart-interactive-map';

export default function AdminDashboard() {
  const { user } = useCurrentUser();

  const dashboardStats = useQuery(
    api.functions.analytics.getDashboardStats,
    user ? undefined : 'skip',
  );

  const profilesMapData = useQuery(
    api.functions.profile.getProfilesMapData,
    user ? {} : 'skip',
  );

  const t = useTranslations('admin.dashboard');
  const t_appointments = useTranslations('admin.appointments');

  if (!user) {
    return null;
  }

  const adminStats = {
    stats: {
      completedRequests: dashboardStats?.requests?.byStatus?.completed || 0,
      processingRequests: dashboardStats?.requests?.byStatus?.submitted || 0,
      pendingRequests: dashboardStats?.requests?.byStatus?.pending || 0,
      totalProfiles: dashboardStats?.profiles?.total || 0,
    },
  };

  return (
    <PageContainer
      title={t('title')}
      description={`${t('welcome', {
        name: user.firstName || user.lastName || '',
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
            Visualisation des concentrations de profils
          </p>
        </div>
        <SmartInteractiveMap profiles={profilesMapData || []} className="w-full h-full" />
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
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {t_appointments('calendar_placeholder')}
            </p>
          </div>
        </CardContainer>
      </div>
    </PageContainer>
  );
}
