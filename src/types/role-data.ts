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
}

// Données pour un manager
export interface ManagerData extends BaseUserData {
  role: 'MANAGER';
  user: ManagerSession;
}

// Données pour un admin
export interface AdminData extends BaseUserData {
  role: 'ADMIN';
  user: AdminSession;
}

// Données pour un super admin
export interface SuperAdminData extends BaseUserData {
  role: 'SUPER_ADMIN';
  user: SuperAdminSession;
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
