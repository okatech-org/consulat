'use client';

import { getOrganizationIdFromUser } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

// Hook principal pour le dashboard - détecte automatiquement le rôle
export function useDashboard(options?: {
  agentId?: string;
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}) {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  const organizationId = getOrganizationIdFromUser(session?.user || null);
  
  // Déterminer quel type de dashboard utiliser
  const dashboardType = useMemo(() => {
    if (userRoles.includes('SUPER_ADMIN')) return 'superadmin';
    if (userRoles.includes('ADMIN')) return 'admin';
    if (userRoles.includes('MANAGER')) return 'manager';
    if (userRoles.includes('AGENT')) return 'agent';
    return 'user';
  }, [userRoles]);

  const enabled = options?.enabled !== false;

  // Queries conditionnelles basées sur le rôle
  const adminStats = api.dashboard.getAdminStats.useQuery(
    {
      organizationId: organizationId,
      startDate: options?.startDate,
      endDate: options?.endDate,
    },
    { 
      enabled: enabled && ['admin', 'superadmin'].includes(dashboardType),
      refetchInterval: 30000, // Actualiser toutes les 30 secondes
    }
  );

  const agentStats = api.dashboard.getAgentStats.useQuery(
    {
      agentId: options?.agentId,
      startDate: options?.startDate,
      endDate: options?.endDate,
    },
    { 
      enabled: enabled && dashboardType === 'agent',
      refetchInterval: 30000,
    }
  );

  const managerStats = api.dashboard.getManagerStats.useQuery(
    {
      managerId: options?.managerId,
      startDate: options?.startDate,
      endDate: options?.endDate,
    },
    { 
      enabled: enabled && dashboardType === 'manager',
      refetchInterval: 30000,
    }
  );

  const superAdminStats = api.dashboard.getSuperAdminStats.useQuery(
    undefined,
    { 
      enabled: enabled && dashboardType === 'superadmin',
      refetchInterval: 30000,
    }
  );

  // Retourner les données appropriées selon le rôle
  const getCurrentStats = () => {
    switch (dashboardType) {
      case 'superadmin':
        return {
          data: superAdminStats.data,
          isLoading: superAdminStats.isLoading,
          error: superAdminStats.error,
        };
      case 'admin':
        return {
          data: adminStats.data,
          isLoading: adminStats.isLoading,
          error: adminStats.error,
        };
      case 'manager':
        return {
          data: managerStats.data,
          isLoading: managerStats.isLoading,
          error: managerStats.error,
        };
      case 'agent':
        return {
          data: agentStats.data,
          isLoading: agentStats.isLoading,
          error: agentStats.error,
        };
      default:
        return {
          data: null,
          isLoading: false,
          error: null,
        };
    }
  };

  const currentStats = getCurrentStats();

  return {
    ...currentStats,
    dashboardType,
    userRoles,
    refresh: () => {
      switch (dashboardType) {
        case 'superadmin':
          superAdminStats.refetch();
          break;
        case 'admin':
          adminStats.refetch();
          break;
        case 'manager':
          managerStats.refetch();
          break;
        case 'agent':
          agentStats.refetch();
          break;
      }
    },
  };
}

// Hook pour les statistiques en temps réel
export function useRealTimeStats() {
  const realTimeStats = api.dashboard.getRealTimeStats.useQuery(
    undefined,
    {
      refetchInterval: 10000, // Actualiser toutes les 10 secondes
      refetchIntervalInBackground: true,
    }
  );

  return {
    stats: realTimeStats.data,
    isLoading: realTimeStats.isLoading,
    error: realTimeStats.error,
    lastUpdated: realTimeStats.data?.lastUpdated,
  };
}

// Hook pour les statistiques par période (graphiques)
export function useStatsByPeriod(params: {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  organizationId?: string;
  agentId?: string;
  enabled?: boolean;
}) {
  const statsByPeriod = api.dashboard.getStatsByPeriod.useQuery(
    {
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
      organizationId: params.organizationId,
      agentId: params.agentId,
    },
    {
      enabled: params.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    data: statsByPeriod.data,
    isLoading: statsByPeriod.isLoading,
    error: statsByPeriod.error,
    refetch: statsByPeriod.refetch,
  };
}

// Hook pour les métriques de performance d'un agent (pour les managers)
export function useAgentPerformanceMetrics(agentId: string, enabled = true) {
  const performanceMetrics = api.dashboard.getAgentPerformanceMetrics.useQuery(
    { agentId },
    { 
      enabled: enabled && !!agentId,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );

  return {
    metrics: performanceMetrics.data,
    isLoading: performanceMetrics.isLoading,
    error: performanceMetrics.error,
    refetch: performanceMetrics.refetch,
  };
}

// Hook pour les statistiques globales des demandes de service
export function useServiceRequestStats() {
  const serviceRequestStats = api.dashboard.getServiceRequestStats.useQuery(
    undefined,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 60000, // 1 minute
    }
  );

  return {
    stats: serviceRequestStats.data,
    isLoading: serviceRequestStats.isLoading,
    error: serviceRequestStats.error,
    refetch: serviceRequestStats.refetch,
  };
}

// Hook utilitaire pour obtenir les couleurs des cartes de statistiques
export function useStatsCardColors() {
  return {
    completed: {
      className: "bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/30 shadow-sm",
      iconClassName: "bg-white dark:bg-neutral-900 text-green-500 dark:text-green-400"
    },
    processing: {
      className: "bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/30 shadow-sm",
      iconClassName: "bg-white dark:bg-neutral-900 text-amber-500 dark:text-amber-400"
    },
    pending: {
      className: "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30 shadow-sm",
      iconClassName: "bg-white dark:bg-neutral-900 text-blue-500 dark:text-blue-400"
    },
    users: {
      className: "bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/30 shadow-sm",
      iconClassName: "bg-white dark:bg-neutral-900 text-indigo-500 dark:text-indigo-400"
    },
    urgent: {
      className: "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/30 shadow-sm",
      iconClassName: "bg-white dark:bg-neutral-900 text-red-500 dark:text-red-400"
    },
  };
}

// Types pour l'export
export type DashboardType = 'superadmin' | 'admin' | 'manager' | 'agent' | 'user';

export interface DashboardOptions {
  organizationId?: string;
  agentId?: string;
  managerId?: string;
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
} 