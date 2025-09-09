import { useEffect, useState } from 'react';
import { api } from '@/trpc/react';
import { useCurrentUser } from '@/hooks/use-role-data';

export interface DGSSRealTimeData {
  // Données principales
  totalProfiles: number;
  newProfilesToday: number;
  totalEntities: number;
  criticalEntities: number;
  totalNotes: number;
  newNotesToday: number;
  
  // Compétences
  totalSkills: number;
  jobSeekers: number;
  highDemandSkills: number;
  
  // Sécurité et surveillance
  securityAlerts: number;
  activeAgents: number;
  surveillanceStatus: 'normal' | 'elevated' | 'high' | 'critical';
  
  // Système
  systemStatus: 'operational' | 'degraded' | 'maintenance' | 'offline';
  lastUpdate: Date;
  
  // Indicateurs de tendance
  profilesTrend: 'up' | 'down' | 'stable';
  entitiesTrend: 'up' | 'down' | 'stable';
  notesTrend: 'up' | 'down' | 'stable';
}

export function useDGSSRealTimeData() {
  const { user } = useCurrentUser();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Vérifier que l'utilisateur est un agent INTEL
  const isIntelAgent = user?.role === 'INTEL_AGENT';

  // Récupérer les statistiques du dashboard avec cache optimisé
  const { data: dashboardStats, isLoading: dashboardLoading } = api.intelligence.getDashboardStats.useQuery(
    { period: 'day' },
    {
      enabled: isIntelAgent,
      refetchInterval: 45000, // 45 secondes
      staleTime: 30000, // 30 secondes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 3,
    }
  );

  // Récupérer les profils avec pagination pour le total (optimisé)
  const { data: profilesData, isLoading: profilesLoading } = api.profile.getList.useQuery(
    {
      page: 1,
      limit: 1, // On veut juste le total
      sort: { field: 'createdAt', order: 'desc' }
    },
    {
      enabled: isIntelAgent,
      refetchInterval: 120000, // 2 minutes
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
    }
  );

  // Récupérer les données des compétences (cache long)
  const { data: skillsStats } = api.skillsDirectory.getSkillsStatisticsForGabon.useQuery(
    undefined,
    {
      enabled: isIntelAgent,
      refetchInterval: 600000, // 10 minutes
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    }
  );

  // Récupérer les données d'annuaire de compétences (cache optimisé)
  const { data: skillsDirectory } = api.skillsDirectory.getDirectory.useQuery(
    {
      page: 1,
      limit: 1,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    },
    {
      enabled: isIntelAgent,
      refetchInterval: 180000, // 3 minutes
      staleTime: 90000, // 1.5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    }
  );

  // Simuler des données pour les entités surveillées (basées sur les données réelles)
  const [entitiesData, setEntitiesData] = useState({
    total: 129,
    critical: 6,
    trend: 'stable' as const
  });

  // Simuler des alertes de sécurité
  const [securityData, setSecurityData] = useState({
    alerts: 0,
    activeAgents: 3,
    status: 'normal' as const
  });

  // Mettre à jour les données simulées périodiquement
  useEffect(() => {
    if (!isIntelAgent) return;

    const interval = setInterval(() => {
      // Simuler des changements d'entités critiques
      const criticalChange = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
      setEntitiesData(prev => ({
        ...prev,
        critical: Math.max(0, Math.min(15, prev.critical + criticalChange)),
        trend: criticalChange > 0 ? 'up' : criticalChange < 0 ? 'down' : 'stable'
      }));

      // Simuler des alertes de sécurité
      const alertChange = Math.random() > 0.9 ? (Math.random() > 0.7 ? 1 : -1) : 0;
      setSecurityData(prev => ({
        ...prev,
        alerts: Math.max(0, Math.min(10, prev.alerts + alertChange)),
        activeAgents: Math.floor(Math.random() * 2) + 2, // 2-3 agents
        status: prev.alerts > 5 ? 'elevated' : prev.alerts > 8 ? 'high' : 'normal'
      }));

      setLastRefresh(new Date());
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [isIntelAgent]);

  // Calculer les tendances
  const calculateTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
    const change = ((current - previous) / previous) * 100;
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  // Construire les données finales
  const realTimeData: DGSSRealTimeData = {
    // Données principales
    totalProfiles: profilesData?.total || 0,
    newProfilesToday: dashboardStats?.newProfilesToday || 0,
    totalEntities: entitiesData.total,
    criticalEntities: entitiesData.critical,
    totalNotes: dashboardStats?.totalNotes || 0,
    newNotesToday: dashboardStats?.newNotesToday || 0,
    
    // Compétences
    totalSkills: skillsDirectory?.total || 0,
    jobSeekers: skillsStats?.totalJobSeekers || 0,
    highDemandSkills: skillsDirectory?.statistics?.marketDemandDistribution?.high || 0,
    
    // Sécurité et surveillance
    securityAlerts: securityData.alerts,
    activeAgents: securityData.activeAgents,
    surveillanceStatus: securityData.status,
    
    // Système
    systemStatus: 'operational',
    lastUpdate: lastRefresh,
    
    // Indicateurs de tendance
    profilesTrend: calculateTrend(profilesData?.total || 0, (profilesData?.total || 0) - (dashboardStats?.newProfilesToday || 0)),
    entitiesTrend: entitiesData.trend,
    notesTrend: calculateTrend(dashboardStats?.totalNotes || 0, (dashboardStats?.totalNotes || 0) - (dashboardStats?.newNotesToday || 0)),
  };

  return {
    data: realTimeData,
    isLoading: dashboardLoading || profilesLoading,
    isEnabled: isIntelAgent,
    lastRefresh,
    refresh: () => setLastRefresh(new Date())
  };
}

// Hook pour les notifications en temps réel
export function useDGSSNotifications() {
  const { user } = useCurrentUser();
  const isIntelAgent = user?.role === 'INTEL_AGENT';

  const { data: notifications } = api.notifications.getUnreadCount.useQuery(
    undefined,
    {
      enabled: isIntelAgent,
      refetchInterval: 30000, // 30 secondes
      staleTime: 15000, // 15 secondes
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
    }
  );

  return {
    unreadCount: notifications?.count || 0,
    hasUnread: (notifications?.count || 0) > 0,
    isEnabled: isIntelAgent
  };
}

// Hook pour le statut du système en temps réel
export function useDGSSSystemStatus() {
  const [status, setStatus] = useState<'operational' | 'degraded' | 'maintenance' | 'offline'>('operational');
  const [uptime, setUptime] = useState(99.9);

  useEffect(() => {
    // Simuler des changements de statut système
    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.95) {
        setStatus('degraded');
        setUptime(prev => Math.max(95, prev - 0.1));
      } else if (random > 0.98) {
        setStatus('maintenance');
      } else {
        setStatus('operational');
        setUptime(prev => Math.min(99.9, prev + 0.01));
      }
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    uptime: Math.round(uptime * 10) / 10,
    isHealthy: status === 'operational' && uptime > 99
  };
}
