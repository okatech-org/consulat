'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { RequestStatus, ServicePriority, UserRole } from '@prisma/client';
import { getAgentsByManager } from '@/actions/organizations';
import { getServiceRequestsList } from '@/actions/service-requests';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Users, FileText, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/schemas/routes';

interface ManagerStats {
  totalAgents: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  averageProcessingTime: number;
  agentPerformance: {
    id: string;
    name: string;
    completedRequests: number;
    averageTime: number;
  }[];
  requestsByStatus: Record<string, number>;
  requestsByPriority: Record<string, number>;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#6b7280',
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.SUBMITTED]: COLORS.secondary,
  [RequestStatus.PENDING]: COLORS.warning,
  [RequestStatus.PENDING_COMPLETION]: COLORS.primary,
  [RequestStatus.COMPLETED]: COLORS.success,
  [RequestStatus.REJECTED]: COLORS.danger,
};

const PRIORITY_COLORS: Record<ServicePriority, string> = {
  [ServicePriority.LOW]: COLORS.secondary,
  [ServicePriority.NORMAL]: COLORS.primary,
  [ServicePriority.HIGH]: COLORS.warning,
  [ServicePriority.URGENT]: COLORS.danger,
};

export function ManagerDashboard() {
  const t = useTranslations('manager.dashboard');
  const t_common = useTranslations('common');
  const user = useCurrentUser();
  const [stats, setStats] = useState<ManagerStats>({
    totalAgents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    averageProcessingTime: 0,
    agentPerformance: [],
    requestsByStatus: {},
    requestsByPriority: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user || !user.roles.includes(UserRole.MANAGER)) return;

      try {
        // Get managed agents
        const agentsResult = await getAgentsByManager(user.id);
        const agents = agentsResult.data || [];

        // Get requests for managed agents
        const requestsResult = await getServiceRequestsList({
          limit: 1000, // Get all requests
        });
        const requests = requestsResult.items || [];

        // Calculate stats
        const requestsByStatus = requests.reduce(
          (acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const requestsByPriority = requests.reduce(
          (acc, req) => {
            acc[req.priority] = (acc[req.priority] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const completedRequests = requests.filter(
          (r) => r.status === RequestStatus.COMPLETED,
        ).length;
        const pendingRequests = requests.filter((r) =>
          [
            RequestStatus.PENDING,
            RequestStatus.PENDING_COMPLETION,
            RequestStatus.IN_PROGRESS,
          ].includes(r.status),
        ).length;

        // Calculate agent performance
        const agentPerformance = agents.map((agent) => ({
          id: agent.id,
          name: agent.name || 'Unknown',
          completedRequests: agent.completedRequests || 0,
          averageTime: agent.averageProcessingTime || 0,
        }));

        const totalCompletedByAgents = agentPerformance.reduce(
          (sum, a) => sum + a.completedRequests,
          0,
        );
        const avgProcessingTime =
          agentPerformance.length > 0
            ? agentPerformance.reduce((sum, a) => sum + a.averageTime, 0) /
              agentPerformance.length
            : 0;

        setStats({
          totalAgents: agents.length,
          totalRequests: requests.length,
          pendingRequests,
          completedRequests,
          averageProcessingTime: avgProcessingTime,
          agentPerformance,
          requestsByStatus,
          requestsByPriority,
        });
      } catch (error) {
        console.error('Error loading manager stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  if (!user || !user.roles.includes(UserRole.MANAGER)) {
    return null;
  }

  const statusData = Object.entries(stats.requestsByStatus).map(([status, count]) => ({
    name: t_common(`status.${status}`),
    value: count,
    fill: STATUS_COLORS[status as RequestStatus],
  }));

  const priorityData = Object.entries(stats.requestsByPriority).map(
    ([priority, count]) => ({
      name: t_common(`priority.${priority}`),
      value: count,
      fill: PRIORITY_COLORS[priority as ServicePriority],
    }),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalAgents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">{t('managedAgents')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRequests')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingRequests} {t('pending')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('completedRequests')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedRequests}</div>
            <Progress
              value={(stats.completedRequests / (stats.totalRequests || 1)) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('avgProcessingTime')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageProcessingTime)} {t('hours')}
            </div>
            <p className="text-xs text-muted-foreground">{t('averageTime')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="agents">{t('agents')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('requestsByStatus')}</CardTitle>
                <CardDescription>{t('statusDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('requestsByPriority')}</CardTitle>
                <CardDescription>{t('priorityDistribution')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('agentPerformance')}</CardTitle>
              <CardDescription>{t('performanceMetrics')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.agentPerformance.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{agent.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.completedRequests} {t('requestsCompleted')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {Math.round(agent.averageTime)} {t('hours')}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('avgTime')}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button asChild className="w-full">
                  <Link href={ROUTES.dashboard.agents}>{t('viewAllAgents')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('performanceTrends')}</CardTitle>
              <CardDescription>{t('monthlyPerformance')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t('comingSoon')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
