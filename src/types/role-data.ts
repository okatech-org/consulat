import type {
  User,
  Appointment,
  Organization,
  UserRole,
  Notification,
  Country,
  UserDocument,
} from '@prisma/client';
import type { FullProfile } from '@/types/profile';
import type { FullServiceRequest } from '@/types/service-request';
import type { ConsularServiceItem } from '@/types/consular-service';
import type { ChildProfileCardData } from '@/types/parental-authority';
import type { BaseAgent } from '@/types/organization';

// Données communes à tous les utilisateurs
interface BaseUserData {
  user: User;
  notifications: Notification[];
  stats: {
    profileCompletion: number;
    unreadNotifications: number;
  };
}

// Données pour un utilisateur standard
export interface UserData extends BaseUserData {
  role: 'USER';
  requests: FullServiceRequest[];
  appointments: Appointment[];
  children: ChildProfileCardData[];
  documents: UserDocument[];
  availableServices: ConsularServiceItem[];
  stats: BaseUserData['stats'] & {
    pendingRequests: number;
    upcomingAppointments: number;
    documentsCount: number;
    childrenCount: number;
  };
}

// Données pour un agent
export interface AgentData extends BaseUserData {
  role: 'AGENT';
  assignedRequests: FullServiceRequest[];
  agentAppointments: Appointment[];
  assignedProfiles: FullProfile[];
  organizationData: Organization;
  agentStats: {
    requestsToProcess: number;
    appointmentsToday: number;
    completedThisWeek: number;
    averageProcessingTime: number;
  };
}

// Données pour un manager
export interface ManagerData extends BaseUserData {
  role: 'MANAGER';
  // Données agent héritées
  assignedRequests: FullServiceRequest[];
  agentAppointments: Appointment[];
  assignedProfiles: FullProfile[];
  organizationData: Organization;
  agentStats: {
    requestsToProcess: number;
    appointmentsToday: number;
    completedThisWeek: number;
    averageProcessingTime: number;
  };
  // Données spécifiques manager
  teamAgents: BaseAgent[];
  teamStats: {
    totalRequests: number;
    processingRequests: number;
    completedRequests: number;
    teamPerformance: Record<string, number>;
  };
  organizationRequests: FullServiceRequest[];
}

// Données pour un admin
export interface AdminData extends BaseUserData {
  role: 'ADMIN';
  // Données agent héritées
  assignedRequests: FullServiceRequest[];
  agentAppointments: Appointment[];
  assignedProfiles: FullProfile[];
  organizationData: Organization;
  agentStats: {
    requestsToProcess: number;
    appointmentsToday: number;
    completedThisWeek: number;
    averageProcessingTime: number;
  };
  // Données manager héritées
  teamAgents: BaseAgent[];
  teamStats: {
    totalRequests: number;
    processingRequests: number;
    completedRequests: number;
    teamPerformance: Record<string, number>;
  };
  organizationRequests: FullServiceRequest[];
  // Données spécifiques admin
  organizations: Organization[];
  allAgents: BaseAgent[];
  systemStats: {
    totalProfiles: number;
    totalRequests: number;
    totalAppointments: number;
    completionRate: number;
  };
  pendingValidations: FullProfile[];
}

// Données pour un super admin
export interface SuperAdminData extends BaseUserData {
  role: 'SUPER_ADMIN';
  // Données agent héritées
  assignedRequests: FullServiceRequest[];
  agentAppointments: Appointment[];
  assignedProfiles: FullProfile[];
  organizationData: Organization;
  agentStats: {
    requestsToProcess: number;
    appointmentsToday: number;
    completedThisWeek: number;
    averageProcessingTime: number;
  };
  // Données manager héritées
  teamAgents: BaseAgent[];
  teamStats: {
    totalRequests: number;
    processingRequests: number;
    completedRequests: number;
    teamPerformance: Record<string, number>;
  };
  organizationRequests: FullServiceRequest[];
  // Données admin héritées
  organizations: Organization[];
  allAgents: BaseAgent[];
  systemStats: {
    totalProfiles: number;
    totalRequests: number;
    totalAppointments: number;
    completionRate: number;
  };
  pendingValidations: FullProfile[];
  // Données spécifiques super admin
  countries: Country[];
  globalStats: {
    totalUsers: number;
    totalOrganizations: number;
    totalRequests: number;
    systemHealth: {
      uptime: number;
      errors: number;
      performance: number;
    };
  };
}

// Type union pour toutes les données possibles
export type RoleData = UserData | AgentData | ManagerData | AdminData | SuperAdminData;

// Type helper pour extraire le rôle d'un RoleData
export type ExtractRole<T extends RoleData> = T['role'];

// Type helper pour vérifier la compatibilité des rôles
export type RoleHierarchy = {
  USER: UserData;
  AGENT: AgentData;
  MANAGER: ManagerData;
  ADMIN: AdminData;
  SUPER_ADMIN: SuperAdminData;
};

// Type helper pour obtenir les données minimales requises pour un rôle
export type MinimalRoleData<R extends UserRole> = R extends keyof RoleHierarchy
  ? RoleHierarchy[R]
  : never;
