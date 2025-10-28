import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';

export interface DGSSRealTimeData {
  totalProfiles: number;
  newProfilesToday: number;
  totalEntities: number;
  criticalEntities: number;
  totalNotes: number;
  newNotesToday: number;

  totalSkills: number;
  jobSeekers: number;
  highDemandSkills: number;

  securityAlerts: number;
  activeAgents: number;
  surveillanceStatus: 'normal' | 'elevated' | 'high' | 'critical';

  systemStatus: 'operational' | 'degraded' | 'maintenance' | 'offline';
  lastUpdate: Date;

  profilesTrend: 'up' | 'down' | 'stable';
  entitiesTrend: 'up' | 'down' | 'stable';
  notesTrend: 'up' | 'down' | 'stable';
}

export function useDGSSRealTimeData() {
  const { user } = useCurrentUser();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const isIntelAgent = user?.roles?.includes('intel_agent' as any);

  const dashboardStats = useQuery(
    api.functions.intelligence.getDashboardStats,
    isIntelAgent ? { period: 'day' } : 'skip',
  );

  const profilesData = useQuery(
    api.functions.profile.getProfilesListEnriched,
    isIntelAgent
      ? {
          page: 1,
          limit: 1,
        }
      : 'skip',
  );

  const skillsStats = useQuery(
    api.functions.competences.getSkillsStatistics,
    isIntelAgent ? {} : 'skip',
  );

  const skillsDirectory = useQuery(
    api.functions.competences.getDirectory,
    isIntelAgent
      ? {
          page: 1,
          limit: 1,
          sortBy: 'updatedAt',
          sortOrder: 'desc',
        }
      : 'skip',
  );

  const [entitiesData, setEntitiesData] = useState<{
    total: number;
    critical: number;
    trend: 'up' | 'down' | 'stable';
  }>({
    total: 129,
    critical: 6,
    trend: 'stable',
  });

  const [securityData, setSecurityData] = useState<{
    alerts: number;
    activeAgents: number;
    status: 'normal' | 'elevated' | 'high' | 'critical';
  }>({
    alerts: 0,
    activeAgents: 3,
    status: 'normal',
  });

  useEffect(() => {
    if (!isIntelAgent) return;

    const interval = setInterval(() => {
      const criticalChange = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      setEntitiesData((prev) => ({
        ...prev,
        critical: Math.max(0, Math.min(15, prev.critical + criticalChange)),
        trend: criticalChange > 0 ? 'up' : criticalChange < 0 ? 'down' : 'stable',
      }));

      const alertChange = Math.random() > 0.9 ? (Math.random() > 0.7 ? 1 : -1) : 0;
      setSecurityData((prev) => ({
        ...prev,
        alerts: Math.max(0, Math.min(10, prev.alerts + alertChange)),
        activeAgents: Math.floor(Math.random() * 2) + 2,
        status: prev.alerts > 5 ? 'elevated' : prev.alerts > 8 ? 'high' : 'normal',
      }));

      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isIntelAgent]);

  const calculateTrend = (
    current: number,
    previous: number,
  ): 'up' | 'down' | 'stable' => {
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const totalProfiles = profilesData?.pagination?.total || 0;
  const profilesWithNotes = dashboardStats?.profilesWithNotes || 0;
  const notesThisPeriod = dashboardStats?.notesThisPeriod || 0;

  const realTimeData: DGSSRealTimeData = {
    totalProfiles,
    newProfilesToday: profilesWithNotes,
    totalEntities: entitiesData.total,
    criticalEntities: entitiesData.critical,
    totalNotes: Object.values(dashboardStats?.notesByType || {}).reduce((a, b) => a + b, 0),
    newNotesToday: notesThisPeriod,

    totalSkills: skillsDirectory?.pagination?.total || 0,
    jobSeekers: skillsStats?.byWorkStatus?.UNEMPLOYED || 0,
    highDemandSkills: skillsStats?.byMarketDemand?.high || 0,

    securityAlerts: securityData.alerts,
    activeAgents: securityData.activeAgents,
    surveillanceStatus: securityData.status,

    systemStatus: 'operational',
    lastUpdate: lastRefresh,

    profilesTrend: calculateTrend(totalProfiles, totalProfiles - profilesWithNotes),
    entitiesTrend: entitiesData.trend,
    notesTrend: calculateTrend(
      Object.values(dashboardStats?.notesByType || {}).reduce((a, b) => a + b, 0),
      Object.values(dashboardStats?.notesByType || {}).reduce((a, b) => a + b, 0) -
        notesThisPeriod,
    ),
  };

  return {
    data: realTimeData,
    isLoading: dashboardStats === undefined || profilesData === undefined,
    isEnabled: isIntelAgent,
    lastRefresh,
    refresh: () => setLastRefresh(new Date()),
  };
}

export function useDGSSNotifications() {
  const { user } = useCurrentUser();
  const isIntelAgent = user?.roles?.includes('intel_agent' as any);

  const notifications = useQuery(
    api.functions.notification.getUnreadNotificationsCount,
    isIntelAgent && user?._id ? { userId: user._id } : 'skip',
  );

  return {
    unreadCount: notifications?.count || 0,
    hasUnread: (notifications?.count || 0) > 0,
    isEnabled: isIntelAgent,
  };
}

export function useDGSSSystemStatus() {
  const [status, setStatus] = useState<
    'operational' | 'degraded' | 'maintenance' | 'offline'
  >('operational');
  const [uptime, setUptime] = useState(99.9);

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.95) {
        setStatus('degraded');
        setUptime((prev) => Math.max(95, prev - 0.1));
      } else if (random > 0.98) {
        setStatus('maintenance');
      } else {
        setStatus('operational');
        setUptime((prev) => Math.min(99.9, prev + 0.01));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    uptime: Math.round(uptime * 10) / 10,
    isHealthy: status === 'operational' && uptime > 99,
  };
}
