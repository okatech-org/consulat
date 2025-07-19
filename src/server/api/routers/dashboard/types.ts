import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { dashboardRouter } from './dashboard';

// Types d'input pour toutes les procédures du router dashboard
export type DashboardRouterInputs = inferRouterInputs<typeof dashboardRouter>;

// Types d'output pour toutes les procédures du router dashboard
export type DashboardRouterOutputs = inferRouterOutputs<typeof dashboardRouter>;

// Types spécifiques pour getAdminStats
export type GetAdminStatsInput = DashboardRouterInputs['getAdminStats'];
export type AdminStats = DashboardRouterOutputs['getAdminStats'];

// Types pour getAgentStats
export type GetAgentStatsInput = DashboardRouterInputs['getAgentStats'];
export type AgentStats = DashboardRouterOutputs['getAgentStats'];

// Types pour getManagerStats
export type GetManagerStatsInput = DashboardRouterInputs['getManagerStats'];
export type ManagerStats = DashboardRouterOutputs['getManagerStats'];

// Types pour getSuperAdminStats
export type SuperAdminStats = DashboardRouterOutputs['getSuperAdminStats']['stats'];

// Types pour getAgentPerformanceMetrics
export type GetAgentPerformanceMetricsInput =
  DashboardRouterInputs['getAgentPerformanceMetrics'];
export type AgentPerformanceMetrics =
  DashboardRouterOutputs['getAgentPerformanceMetrics'];

// Types pour getServiceRequestStats
export type ServiceRequestStats = DashboardRouterOutputs['getServiceRequestStats'];

// Types pour getStatsByPeriod
export type GetStatsByPeriodInput = DashboardRouterInputs['getStatsByPeriod'];
export type StatsByPeriod = DashboardRouterOutputs['getStatsByPeriod'];

// Types pour getRealTimeStats
export type RealTimeStats = DashboardRouterOutputs['getRealTimeStats'];

// Types pour getProfilesGeographicData
export type GetProfilesGeographicDataInput =
  DashboardRouterInputs['getProfilesGeographicData'];
export type ProfilesGeographicData = DashboardRouterOutputs['getProfilesGeographicData'];

export interface ProfileLocation {
  id: string;
  address: string;
  city: string;
  country: string;
  count: number;
}
