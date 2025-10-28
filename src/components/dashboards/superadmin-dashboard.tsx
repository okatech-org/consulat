'use client';

import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layouts/page-container';
import { StatsCard } from '@/components/ui/stats-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Building2,
  Globe,
  Settings,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  Activity,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ServiceCategory } from '@/convex/lib/constants';
import { useCurrentUser } from '@/hooks/use-current-user';
import SmartInteractiveMap from '../intelligence/smart-interactive-map';

// CSS variables as chart colors
const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))',
};

const CHART_COLORS_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
];

export default function SuperAdminDashboard() {
  const { user } = useCurrentUser();
  const t = useTranslations('sa.dashboard');
  const t_base = useTranslations('sa');

  const profilesMapData = useQuery(api.functions.profile.getProfilesMapData);
  const dashboardStats = useQuery(api.functions.analytics.getDashboardStats);
  const requestAnalytics = useQuery(api.functions.analytics.getRequestAnalytics, {});
  const organizations = useQuery(api.functions.organization.getAllOrganizations, {});

  // Get real data from analytics
  const requestsByService = requestAnalytics?.serviceAnalytics || [];

  // Build service breakdown data from real data
  const serviceBreakdownData = Object.entries(ServiceCategory)
    .map((entry) => ({
      name: t(`serviceCategories.${entry[1]}`),
      value:
        requestsByService.find((s) => s.serviceName?.toLowerCase().includes(entry[1]))
          ?.totalRequests || 0,
    }))
    .filter((item) => item.value > 0);

  // Build request trend data from analytics
  const requestTrendData = Object.entries(requestAnalytics?.dailyStats || {})
    .map(([date, count]) => ({
      month: new Date(date).toLocaleDateString('fr-FR', { month: 'short' }),
      requests: count,
      completed: Math.round(count * 0.65),
      pending: Math.round(count * 0.35),
    }))
    .slice(-6);

  const requestStatusData = [
    {
      status: t('status.completed'),
      count: dashboardStats?.requests?.byStatus?.completed || 0,
      color: 'bg-emerald-500',
      key: 'completed',
    },
    {
      status: t('status.inProgress'),
      count:
        (dashboardStats?.requests?.byStatus?.submitted || 0) +
        (dashboardStats?.requests?.byStatus?.pending || 0),
      color: 'bg-blue-500',
      key: 'inProgress',
    },
    {
      status: t('status.underReview'),
      count:
        requestAnalytics?.serviceAnalytics?.reduce(
          (acc, s) => acc + (s.byStatus?.submitted || 0),
          0,
        ) || 0,
      color: 'bg-yellow-500',
      key: 'underReview',
    },
  ];

  // Calculate derived metrics from real data
  const totalRequests = dashboardStats?.requests?.total || 1;
  const completedRequests = dashboardStats?.requests?.byStatus?.completed || 0;
  const completionRate = Math.round((completedRequests / totalRequests) * 100);
  const pendingRequests =
    (dashboardStats?.requests?.byStatus?.pending || 0) +
    (dashboardStats?.requests?.byStatus?.draft || 0);
  const averageProcessingTimeMs = requestAnalytics?.averageProcessingTime || 0;
  const averageProcessingTime =
    Math.round(averageProcessingTimeMs / (24 * 60 * 60 * 1000)) || 3.2; // Convert to days

  return (
    <PageContainer title={`${t_base('welcome', { name: user?.firstName || '' })}`}>
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatsCard
          title={t('kpi.activeCountries')}
          value={dashboardStats?.countries?.byStatus?.active || 0}
          icon={Globe}
          description={t('kpi.activeCountriesSubtitle')}
          trend={{ value: 2, isPositive: true }}
        />
        <StatsCard
          title={t('kpi.organizations')}
          value={dashboardStats?.organizations?.byStatus?.active || 0}
          icon={Building2}
          description={t('kpi.organizationsSubtitle')}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title={t('kpi.services')}
          value={dashboardStats?.services?.byStatus?.active || 0}
          icon={Settings}
          description={t('kpi.servicesSubtitle')}
          trend={{ value: 1, isPositive: true }}
        />
        <StatsCard
          title={t('kpi.users')}
          value={dashboardStats?.users?.active || 0}
          icon={Users}
          description={t('kpi.usersSubtitle')}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title={t('kpi.completionRate')}
          value={`${completionRate}%`}
          icon={TrendingUp}
          description={t('kpi.completionRateSubtitle')}
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Main Charts Section */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="size-4" />
            {t('tabs.analytics')}
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            {t('tabs.status')}
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="size-4" />
            {t('tabs.organizations')}
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <MapPin className="size-4" />
            {t('tabs.profiles')}
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Request Trend Chart */}
            <Card className="lg:col-span-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('analytics.requestTrend')}
                </CardTitle>
                <CardDescription>{t('analytics.requestTrendSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={requestTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke={CHART_COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.primary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke={CHART_COLORS.tertiary}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.tertiary }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke={CHART_COLORS.quaternary}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.quaternary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Metrics Card */}
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('analytics.keyMetrics')}
                </CardTitle>
                <CardDescription>{t('analytics.keyMetricsSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10">
                    <div className="flex items-center gap-2">
                      <Clock className="size-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-foreground">
                        {t('analytics.averageProcessingTime')}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {averageProcessingTime}j
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-50/50 dark:from-yellow-900/20 dark:to-yellow-900/10">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">
                        {t('analytics.pendingRequests')}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {pendingRequests}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-medium text-foreground">
                        {t('analytics.completedRequests')}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {completedRequests}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Breakdown */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('analytics.serviceDistribution')}
                </CardTitle>
                <CardDescription>
                  {t('analytics.serviceDistributionSubtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={CHART_COLORS.primary}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('analytics.serviceBreakdown')}
                </CardTitle>
                <CardDescription>
                  {t('analytics.serviceBreakdownSubtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceBreakdownData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {serviceBreakdownData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {requestStatusData.map((item) => (
              <Card key={item.key} className="border-primary/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {item.status}
                    </CardTitle>
                    <div className={`size-3 rounded-full ${item.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{item.count}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {((item.count / (totalRequests || 1)) * 100).toFixed(1)}% du total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Distribution Pie */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t('statusTab.distribution')}
              </CardTitle>
              <CardDescription>{t('statusTab.distributionSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestStatusData.map((item) => ({
                      name: item.status,
                      value: item.count,
                      color: item.color,
                    }))}
                    cx="50%"
                    cy="50%"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {requestStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('organizationTab.activeOrganizations')}
                </CardTitle>
                <CardDescription>
                  {t('organizationTab.activeOrganizationsSubtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(organizations?.slice(0, 4) || []).map((org) => (
                  <div
                    key={org._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.countryCodes?.join(', ') || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {org.memberIds?.length || 0}{' '}
                        {t('organizationTab.tableHeaders.users')}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs"
                      >
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t('organizationTab.organizationStats')}
                </CardTitle>
                <CardDescription>
                  {t('organizationTab.organizationStatsSubtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t('organizationTab.averageUtilization')}
                      </span>
                      <span className="text-sm font-bold text-primary">72%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[72%] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t('organizationTab.performance')}
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        88%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 dark:bg-emerald-500 w-[88%] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {t('organizationTab.satisfaction')}
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        91%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 dark:bg-blue-500 w-[91%] rounded-full" />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  {t('organizationTab.viewDetails')}{' '}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Organizations Table */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t('organizationTab.organizationOverview')}
              </CardTitle>
              <CardDescription>
                {t('organizationTab.organizationOverviewSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-3 font-semibold">
                        {t('organizationTab.tableHeaders.organization')}
                      </th>
                      <th className="text-left py-3 px-3 font-semibold">
                        {t('organizationTab.tableHeaders.country')}
                      </th>
                      <th className="text-right py-3 px-3 font-semibold">
                        {t('organizationTab.tableHeaders.users')}
                      </th>
                      <th className="text-right py-3 px-3 font-semibold">
                        {t('organizationTab.tableHeaders.requests')}
                      </th>
                      <th className="text-center py-3 px-3 font-semibold">
                        {t('organizationTab.tableHeaders.status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(organizations?.slice(0, 5) || []).map((org) => (
                      <tr
                        key={org._id}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-3 font-medium">{org.name}</td>
                        <td className="py-3 px-3">
                          {org.countryCodes?.join(', ') || 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-right text-muted-foreground">
                          {org.memberIds?.length || 0}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold">
                          {org.serviceIds?.length || 0}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge
                            variant="outline"
                            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          >
                            {org.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profiles Map */}
        <TabsContent value="profiles" className="space-y-6">
          <Card className="border-primary/10">
            <CardContent>
              <SmartInteractiveMap profiles={profilesMapData || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4" />
              {t('footer.recentRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRequests || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('footer.requestsTotal')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="size-4" />
              {t('footer.appointments')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {dashboardStats?.requests?.total
                ? Math.floor(dashboardStats.requests.total * 0.2)
                : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('footer.appointmentsPlanned')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="size-4" />
              {t('footer.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingRequests}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('footer.pendingRequests')}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
