'use client';

import { StatsCard } from '@/components/ui/stats-card';
import { format } from 'date-fns';
import {
  ArrowRight,
  Users,
  Clock,
  CheckCircle,
  FileText,
  TrendingUp,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function ManagerDashboard() {
  const { user, loading } = useCurrentUser();
  const t = useTranslations('manager.dashboard');
  const t_status = useTranslations('inputs.requestStatus.options');

  const dashboardData = useQuery(
    api.functions.analytics.getManagerDashboardData,
    user?._id ? { userId: user._id } : 'skip',
  );

  if (loading || !user) {
    return null;
  }

  if (!dashboardData) {
    return (
      <PageContainer title={t('title')} description={t('description')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </PageContainer>
    );
  }

  const { stats, managedAgents, recentRequests, requestsByStatus } = dashboardData;

  const statusKeys: Record<string, string> = {
    submitted: 'submitted',
    pending: 'pending',
    pendingCompletion: 'pending_completion',
    validated: 'validated',
    rejected: 'rejected',
    inProduction: 'in_production',
    readyForPickup: 'ready_for_pickup',
    completed: 'completed',
  };

  return (
    <PageContainer title={t('title')} description={t('description')}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="agents">{t('tabs.agents')}</TabsTrigger>
          <TabsTrigger value="requests">{t('tabs.requests')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('tabs.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('stats.total_agents')}
              value={stats.totalAgents}
              description={t('stats.agents_description')}
              icon={Users}
              className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
            />
            <StatsCard
              title={t('stats.pending_requests')}
              value={stats.pendingRequests}
              description={t('stats.pending_description')}
              icon={Clock}
              className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
            />
            <StatsCard
              title={t('stats.processing_requests')}
              value={stats.processingRequests}
              description={t('stats.processing_description')}
              icon={FileText}
              className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm"
              iconClassName="bg-white dark:bg-neutral-900 text-indigo-500 dark:text-indigo-400"
            />
            <StatsCard
              title={t('stats.completed_requests')}
              value={stats.completedRequests}
              description={t('stats.completed_description')}
              icon={CheckCircle}
              trend={stats.trend}
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
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.slice(0, 5).map((request) => (
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
                              request.status === 'completed'
                                ? 'default'
                                : [
                                      'validated',
                                      'in_production',
                                      'ready_for_pickup',
                                      'appointment_scheduled',
                                    ].includes(request.status)
                                  ? 'default'
                                  : 'secondary'
                            }
                          >
                            {t_status(request.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {format(new Date(request.createdAt), 'dd MMM yyyy')}
                          </span>
                          {request.assignedTo && (
                            <span className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              {request.assignedTo.name || 'Agent'}
                            </span>
                          )}
                        </div>
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

            {/* Agent Performance */}
            <CardContainer
              title={t('stats.agent_performance')}
              action={
                <Button variant="ghost" size="mobile" asChild>
                  <Link href={ROUTES.dashboard.agents}>{t('actions.see_all')}</Link>
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
                  <Link href={ROUTES.dashboard.agents}>
                    {t('actions.view_all_agents')}
                  </Link>
                </Button>
              }
            >
              {managedAgents.length > 0 ? (
                <div className="space-y-4">
                  {managedAgents.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between space-x-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{agent.name || 'Agent'}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent._count.assignedRequests} {t('requestsCompleted')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {agent.completedRequests || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('completedRequests')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">{t('stats.no_agents')}</p>
                </div>
              )}
            </CardContainer>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <CardContainer title={t('agents')} subtitle={t('managedAgents')}>
            {managedAgents.length > 0 ? (
              <div className="space-y-4">
                {managedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-md bg-primary/10 p-2">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{agent.name || 'Agent'}</p>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {agent._count.assignedRequests}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('totalRequests')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {agent.completedRequests || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('completedRequests')}
                        </p>
                      </div>
                      <Button variant="outline" size="mobile" asChild>
                        <Link href={`${ROUTES.dashboard.agents}/${agent.id}`}>
                          {t('actions.view_details')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">{t('stats.no_agents')}</p>
              </div>
            )}
          </CardContainer>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <CardContainer title={t('requestsByStatus')} subtitle={t('statusDistribution')}>
            <div className="space-y-4">
              {Object.entries(requestsByStatus).map(([status, count]) => {
                const total = Object.values(requestsByStatus).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {statusKeys[status] ? t_status(statusKeys[status]) : status}
                      </span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContainer>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CardContainer
            title={t('performanceTrends')}
            subtitle={t('monthlyPerformance')}
            className="h-[400px] flex items-center justify-center"
          >
            <div className="text-center">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('comingSoon')}</p>
            </div>
          </CardContainer>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
