'use client';

import {
  useDashboard,
  useRealTimeStats,
  useStatsCardColors,
} from '@/hooks/use-dashboard';
import { StatsCard } from '@/components/ui/stats-card';
import { PageContainer } from '@/components/layouts/page-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorCard } from '@/components/ui/error-card';
import { useTranslations } from 'next-intl';
import {
  CheckCircle,
  Clock,
  FileText,
  Users,
  Calendar,
  Globe,
  Building2,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

export default function DashboardClient() {
  const t = useTranslations('dashboard');
  const colors = useStatsCardColors();
  const startDate = new Date();
  const endDate = subDays(startDate, 30);

  const { data, isLoading, error, dashboardType, refresh } = useDashboard({
    startDate,
    endDate,
  });

  const { stats: realTimeStats, lastUpdated } = useRealTimeStats();

  if (isLoading) {
    return (
      <PageContainer title={t('title')} description={t('description')}>
        <LoadingSkeleton variant="grid" columns={2} rows={2} aspectRatio="4/3" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title={t('title')} description={t('description')}>
        <ErrorCard
          title={t('error.title')}
          description={t('error.description')}
          action={<Button onClick={refresh}>{t('error.retry')}</Button>}
        />
      </PageContainer>
    );
  }

  // Rendu conditionnel basé sur le type de dashboard
  const renderDashboardContent = () => {
    if (!data) return null;

    switch (dashboardType) {
      case 'superadmin':
        return <SuperAdminDashboard data={data} colors={colors} />;
      case 'admin':
        return <AdminDashboard data={data} colors={colors} />;
      case 'manager':
        return <ManagerDashboard data={data} colors={colors} />;
      case 'agent':
        return <AgentDashboard data={data} colors={colors} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title={t(`${dashboardType}.title`)}
      description={t(`${dashboardType}.description`)}
    >
      {/* Statistiques en temps réel */}
      {realTimeStats && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('realtime.title')}</h2>
            <Badge variant="outline" className="text-xs">
              {t('realtime.last_updated')}:{' '}
              {lastUpdated && format(lastUpdated, 'HH:mm:ss')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              title={t('realtime.requests_today')}
              value={realTimeStats.requestsToday}
              icon={FileText}
              {...colors.pending}
            />
            <StatsCard
              title={t('realtime.appointments_today')}
              value={realTimeStats.appointmentsToday}
              icon={Calendar}
              {...colors.processing}
            />
            <StatsCard
              title={t('realtime.completed_today')}
              value={realTimeStats.completedToday}
              icon={CheckCircle}
              {...colors.completed}
            />
            <StatsCard
              title={t('realtime.urgent_pending')}
              value={realTimeStats.urgentPending}
              icon={AlertTriangle}
              {...colors.urgent}
            />
          </div>
        </div>
      )}

      {/* Contenu principal du dashboard */}
      {renderDashboardContent()}
    </PageContainer>
  );
}

// Composant SuperAdmin Dashboard
function SuperAdminDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.superadmin');
  const dashboardData = data as { stats?: Record<string, number> };

  if (!dashboardData?.stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.countries')}
          value={dashboardData.stats.totalCountries || 0}
          description={`${dashboardData.stats.activeCountries || 0} ${t('stats.active')}`}
          icon={Globe}
          {...(colors as Record<string, Record<string, string>>).pending}
        />
        <StatsCard
          title={t('stats.organizations')}
          value={dashboardData.stats.totalOrganizations || 0}
          description={`${dashboardData.stats.activeOrganizations || 0} ${t('stats.active')}`}
          icon={Building2}
          {...(colors as Record<string, Record<string, string>>).processing}
        />
        <StatsCard
          title={t('stats.services')}
          value={dashboardData.stats.totalServices || 0}
          icon={Settings}
          {...(colors as Record<string, Record<string, string>>).users}
        />
        <StatsCard
          title={t('stats.users')}
          value={dashboardData.stats.totalUsers || 0}
          icon={Users}
          {...(colors as Record<string, Record<string, string>>).completed}
        />
      </div>
    </div>
  );
}

// Composant Admin Dashboard
function AdminDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.admin');
  const dashboardData = data as {
    stats?: Record<string, number>;
    recentData?: {
      recentRegistrations?: Array<{
        id: string;
        firstName?: string;
        lastName?: string;
        updatedAt: string;
        user?: { email?: string };
      }>;
      upcomingAppointments?: Array<{
        id: string;
        date: string;
        attendee?: { name?: string };
        request?: { service?: { name?: string } };
      }>;
    };
  };

  if (!dashboardData?.stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.completed_requests')}
          value={dashboardData.stats.completedRequests || 0}
          icon={CheckCircle}
          {...(colors as Record<string, Record<string, string>>).completed}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={dashboardData.stats.processingRequests || 0}
          icon={Clock}
          {...(colors as Record<string, Record<string, string>>).processing}
        />
        <StatsCard
          title={t('stats.validated_profiles')}
          value={dashboardData.stats.validatedProfiles || 0}
          icon={Users}
          {...(colors as Record<string, Record<string, string>>).users}
        />
        <StatsCard
          title={t('stats.pending_profiles')}
          value={dashboardData.stats.pendingProfiles || 0}
          icon={FileText}
          {...(colors as Record<string, Record<string, string>>).pending}
        />
      </div>

      {/* Données récentes */}
      {dashboardData.recentData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inscriptions récentes */}
          <Card>
            <CardHeader>
              <CardTitle>{t('recent.registrations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentData.recentRegistrations?.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {profile.firstName} {profile.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.user?.email}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {format(new Date(profile.updatedAt), 'dd/MM', { locale: fr })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rendez-vous à venir */}
          <Card>
            <CardHeader>
              <CardTitle>{t('recent.appointments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentData.upcomingAppointments?.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{appointment.attendee?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.request?.service?.name}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {format(new Date(appointment.date), 'dd/MM HH:mm', { locale: fr })}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Composant Manager Dashboard
function ManagerDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.manager');
  const dashboardData = data as {
    stats?: Record<string, number> & { trend?: { value: number; isPositive: boolean } };
    managedAgents?: Array<{
      id: string;
      name?: string;
      completedRequests?: number;
      _count: { assignedRequests: number };
    }>;
  };

  if (!dashboardData?.stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.total_agents')}
          value={dashboardData.stats.totalAgents || 0}
          icon={Users}
          {...(colors as Record<string, Record<string, string>>).users}
        />
        <StatsCard
          title={t('stats.pending_requests')}
          value={dashboardData.stats.pendingRequests || 0}
          icon={Clock}
          {...(colors as Record<string, Record<string, string>>).pending}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={dashboardData.stats.processingRequests || 0}
          icon={FileText}
          {...(colors as Record<string, Record<string, string>>).processing}
        />
        <StatsCard
          title={t('stats.completed_requests')}
          value={dashboardData.stats.completedRequests || 0}
          icon={CheckCircle}
          trend={dashboardData.stats.trend}
          {...(colors as Record<string, Record<string, string>>).completed}
        />
      </div>

      {/* Agents managés */}
      {dashboardData.managedAgents && (
        <Card>
          <CardHeader>
            <CardTitle>{t('managed_agents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.managedAgents.slice(0, 5).map((agent) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{agent.name || 'Agent'}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent._count.assignedRequests} {t('assigned_requests')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{agent.completedRequests || 0}</p>
                    <p className="text-xs text-muted-foreground">{t('completed')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Composant Agent Dashboard
function AgentDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.agent');
  const dashboardData = data as {
    stats?: Record<string, number>;
    recentRequests?: Array<{
      id: string;
      status: string;
      createdAt: string;
      service?: { name?: string };
    }>;
  };

  if (!dashboardData?.stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.upcoming_appointments')}
          value={dashboardData.stats.upcomingAppointments || 0}
          icon={Calendar}
          {...(colors as Record<string, Record<string, string>>).pending}
        />
        <StatsCard
          title={t('stats.pending_requests')}
          value={dashboardData.stats.pendingRequests || 0}
          icon={Clock}
          {...(colors as Record<string, Record<string, string>>).processing}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={dashboardData.stats.processingRequests || 0}
          icon={FileText}
          {...(colors as Record<string, Record<string, string>>).users}
        />
        <StatsCard
          title={t('stats.completed_requests')}
          value={dashboardData.stats.completedRequests || 0}
          icon={CheckCircle}
          {...(colors as Record<string, Record<string, string>>).completed}
        />
      </div>

      {/* Demandes récentes */}
      {dashboardData.recentRequests && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recent_requests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.service?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="outline">{request.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
