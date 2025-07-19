import type {
  User,
  Organization,
  UserRole,
  Notification,
  UserDocument,
} from '@prisma/client';
import type { FullProfile } from '@/types/profile';
import type { RequestDetails, RequestListItem } from '@/server/api/routers/requests/misc';
import type {
  UserSession,
  AgentSession,
  ManagerSession,
  AdminSession,
  SuperAdminSession,
} from '@/types/user';
import type { ServiceListItem } from '@/server/api/routers/services/misc';
import type { GroupedAppointments } from '@/server/api/routers/appointments/misc';
import type { CountryListItem } from '@/server/api/routers/countries/types';
import type { OrganizationListItem } from '@/server/api/routers/organizations/types';
import type { AdminStats, SuperAdminStats } from '@/server/api/routers/dashboard/types';

// Données communes à tous les utilisateurs
interface BaseUserData {
  user: User;
  notifications: Notification[];
  stats: {
    unreadNotifications: number;
  };
}

// Données pour un utilisateur standard
export interface UserData extends BaseUserData {
  role: 'USER';
  user: UserSession;
  profile: FullProfile | null;
  requests: RequestListItem[];
  currentRequest: RequestDetails | null;
  appointments: GroupedAppointments | null | undefined;
  children: FullProfile['parentAuthorities'];
  documents: UserDocument[];
  availableServices: ServiceListItem[];
  organizationData?: Pick<Organization, 'id' | 'name' | 'metadata'>;
  stats: BaseUserData['stats'] & {
    pendingRequests: number;
    upcomingAppointments: number;
    documentsCount: number;
    childrenCount: number;
    profileCompletion: number;
  };
}

// Données pour un agent
export interface AgentData extends BaseUserData {
  role: 'AGENT';
  user: AgentSession;
  assignedRequests: RequestListItem[];
  agentAppointments: GroupedAppointments | null;
  agentStats: {
    pendingRequests: number;
    processingRequests: number;
    completedRequests: number;
    totalRequests: number;
    upcomingAppointments: number;
    completedAppointments: number;
  };
}

// Données pour un manager
export interface ManagerData extends BaseUserData {
  role: 'MANAGER';
  user: ManagerSession;
  managedAgents: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    completedRequests?: number | null;
    _count: { assignedRequests: number };
  }>;
  managerStats: {
    totalAgents: number;
    pendingRequests: number;
    processingRequests: number;
    completedRequests: number;
    avgProcessingTime: number;
    trend: { value: number; isPositive: boolean };
  };
  recentRequests: RequestListItem[];
  requestsByStatus: Record<string, number>;
}

// Données pour un admin
export interface AdminData extends BaseUserData {
  role: 'ADMIN';
  user: AdminSession;
  organizationData: {
    id: string;
    name: string;
    type: string;
    status: string;
    countries: Array<{ id: string; name: string; code: string }>;
    _count: { services: number; agents: number };
  } | null;
  adminStats: AdminStats;
  recentData: {
    recentRegistrations: Array<{
      id: string;
      firstName?: string;
      lastName?: string;
      updatedAt: string;
      user?: { email?: string };
    }>;
    upcomingAppointments: Array<{
      id: string;
      date: string;
      attendee?: { name?: string };
      request?: { service?: { name?: string } };
    }>;
  };
}

// Données pour un super admin
export interface SuperAdminData extends BaseUserData {
  role: 'SUPER_ADMIN';
  user: SuperAdminSession;
  organizations: OrganizationListItem[];
  countries: CountryListItem[];
  superAdminStats: SuperAdminStats;
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
