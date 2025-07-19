'use client';

import { useRealTimeStats, useStatsCardColors } from '@/hooks/use-dashboard';
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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  useUserData,
  useAgentData,
  useManagerData,
  useAdminData,
  useSuperAdminData,
  useCurrentRole,
} from '@/hooks/use-role-data';

export default function DashboardClient() {
  const t = useTranslations('dashboard');
  const colors = useStatsCardColors();
  const role = useCurrentRole();

  const { stats: realTimeStats, lastUpdated } = useRealTimeStats();

  // Utiliser les hooks spécifiques selon le rôle
  const getData = () => {
    try {
      switch (role) {
        case 'USER':
          return { data: useUserData(), error: null, isLoading: false };
        case 'AGENT':
          return { data: useAgentData(), error: null, isLoading: false };
        case 'MANAGER':
          return { data: useManagerData(), error: null, isLoading: false };
        case 'ADMIN':
          return { data: useAdminData(), error: null, isLoading: false };
        case 'SUPER_ADMIN':
          return { data: useSuperAdminData(), error: null, isLoading: false };
        default:
          return { data: null, error: new Error('Rôle non reconnu'), isLoading: false };
      }
    } catch (error) {
      return { data: null, error: error as Error, isLoading: false };
    }
  };

  const { data, error, isLoading } = getData();

  const refresh = () => {
    window.location.reload();
  };

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

    switch (role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard data={data} colors={colors} />;
      case 'ADMIN':
        return <AdminDashboard data={data} colors={colors} />;
      case 'MANAGER':
        return <ManagerDashboard data={data} colors={colors} />;
      case 'AGENT':
        return <AgentDashboard data={data} colors={colors} />;
      case 'USER':
        return <UserDashboard data={data} colors={colors} />;
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title={t(role ? `${role.toLowerCase()}.title` : 'title')}
      description={t(role ? `${role.toLowerCase()}.description` : 'description')}
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

// Composant User Dashboard
function UserDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.user');
  const userData = data as any;

  if (!userData.stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.profile_completion')}
          value={`${userData.stats.profileCompletion}%`}
          icon={Users}
          {...(colors as any).users}
        />
        <StatsCard
          title={t('stats.pending_requests')}
          value={userData.stats.pendingRequests || 0}
          icon={Clock}
          {...(colors as any).pending}
        />
        <StatsCard
          title={t('stats.upcoming_appointments')}
          value={userData.stats.upcomingAppointments || 0}
          icon={Calendar}
          {...(colors as any).processing}
        />
        <StatsCard
          title={t('stats.documents_count')}
          value={userData.stats.documentsCount || 0}
          icon={FileText}
          {...(colors as any).completed}
        />
      </div>
    </div>
  );
}

// Composant SuperAdmin Dashboard
function SuperAdminDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.superadmin');
  const superAdminData = data as any;

  if (!superAdminData.superAdminStats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.countries')}
          value={superAdminData.superAdminStats.totalCountries || 0}
          description={`${superAdminData.superAdminStats.activeCountries || 0} ${t('stats.active')}`}
          icon={Globe}
          {...(colors as any).pending}
        />
        <StatsCard
          title={t('stats.organizations')}
          value={superAdminData.superAdminStats.totalOrganizations || 0}
          description={`${superAdminData.superAdminStats.activeOrganizations || 0} ${t('stats.active')}`}
          icon={Building2}
          {...(colors as any).processing}
        />
        <StatsCard
          title={t('stats.services')}
          value={superAdminData.superAdminStats.totalServices || 0}
          icon={Settings}
          {...(colors as any).users}
        />
        <StatsCard
          title={t('stats.users')}
          value={superAdminData.superAdminStats.totalUsers || 0}
          icon={Users}
          {...(colors as any).completed}
        />
      </div>
    </div>
  );
}

// Composant Admin Dashboard
function AdminDashboard({ data, colors }: { data: unknown; colors: unknown }) {
  const t = useTranslations('dashboard.admin');
  const adminData = data as any;

  if (!adminData.adminStats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.completed_requests')}
          value={adminData.adminStats.completedRequests || 0}
          icon={CheckCircle}
          {...(colors as any).completed}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={adminData.adminStats.processingRequests || 0}
          icon={Clock}
          {...(colors as any).processing}
        />
        <StatsCard
          title={t('stats.validated_profiles')}
          value={adminData.adminStats.validatedProfiles || 0}
          icon={Users}
          {...(colors as any).users}
        />
        <StatsCard
          title={t('stats.pending_profiles')}
          value={adminData.adminStats.pendingProfiles || 0}
          icon={FileText}
          {...(colors as any).pending}
        />
      </div>

      {/* Données récentes */}
      {adminData.recentData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('recent.registrations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.recentData.recentRegistrations
                  ?.slice(0, 5)
                  .map((registration: any) => (
                    <div
                      key={registration.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {registration.firstName} {registration.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {registration.user?.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(registration.updatedAt), 'dd/MM', {
                          locale: fr,
                        })}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('recent.appointments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.recentData.upcomingAppointments
                  ?.slice(0, 5)
                  .map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{appointment.attendee?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.request?.service?.name}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {format(new Date(appointment.date), 'dd/MM', { locale: fr })}
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
  const managerData = data as any;

  if (!managerData.managerStats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.total_agents')}
          value={managerData.managerStats.totalAgents || 0}
          icon={Users}
          {...(colors as any).users}
        />
        <StatsCard
          title={t('stats.pending_requests')}
          value={managerData.managerStats.pendingRequests || 0}
          icon={Clock}
          {...(colors as any).pending}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={managerData.managerStats.processingRequests || 0}
          icon={FileText}
          {...(colors as any).processing}
        />
        <StatsCard
          title={t('stats.completed_requests')}
          value={managerData.managerStats.completedRequests || 0}
          icon={CheckCircle}
          trend={managerData.managerStats.trend}
          {...(colors as any).completed}
        />
      </div>

      {/* Agents managés */}
      {managerData.managedAgents && managerData.managedAgents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('managed_agents.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {managerData.managedAgents.slice(0, 6).map((agent: any) => (
                <div key={agent.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{agent.name}</p>
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>
                      {t('managed_agents.active')}: {agent._count?.assignedRequests || 0}
                    </span>
                    <span>
                      {t('managed_agents.completed')}: {agent.completedRequests || 0}
                    </span>
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
  const agentData = data as any;

  if (!agentData.agentStats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('stats.upcoming_appointments')}
          value={agentData.agentStats.upcomingAppointments || 0}
          icon={Calendar}
          {...(colors as any).pending}
        />
        <StatsCard
          title={t('stats.pending_requests')}
          value={agentData.agentStats.pendingRequests || 0}
          icon={Clock}
          {...(colors as any).processing}
        />
        <StatsCard
          title={t('stats.processing_requests')}
          value={agentData.agentStats.processingRequests || 0}
          icon={FileText}
          {...(colors as any).users}
        />
        <StatsCard
          title={t('stats.completed_requests')}
          value={agentData.agentStats.completedRequests || 0}
          icon={CheckCircle}
          {...(colors as any).completed}
        />
      </div>

      {/* Demandes récentes */}
      {agentData.assignedRequests && agentData.assignedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('recent_requests.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentData.assignedRequests.slice(0, 5).map((request: any) => (
                <div key={request.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.service?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Badge
                    variant={request.status === 'COMPLETED' ? 'default' : 'secondary'}
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
