# Architecture de données typées par rôle

## Vue d'ensemble

Cette architecture permet de charger et typer les données en fonction du rôle de l'utilisateur, garantissant que chaque type d'utilisateur n'accède qu'aux données pertinentes avec un typage strict.

## Types de base par rôle

```typescript
// src/types/role-data.ts
import type {
  User,
  Profile,
  ServiceRequest,
  Appointment,
  Organization,
  Agent,
  DashboardStats,
} from '@/types';

// Données communes à tous les utilisateurs
interface BaseUserData {
  user: User;
  profile: Profile;
  notifications: Notification[];
  stats: {
    profileCompletion: number;
    unreadNotifications: number;
  };
}

// Données pour un utilisateur standard
export interface UserData extends BaseUserData {
  role: 'USER';
  requests: ServiceRequest[];
  appointments: Appointment[];
  children: ChildProfile[];
  documents: Document[];
  availableServices: Service[];
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
  assignedRequests: ServiceRequest[];
  agentAppointments: Appointment[];
  assignedProfiles: Profile[];
  organizationData: Organization;
  agentStats: {
    requestsToProcess: number;
    appointmentsToday: number;
    completedThisWeek: number;
    averageProcessingTime: number;
  };
}

// Données pour un manager
export interface ManagerData extends AgentData {
  role: 'MANAGER';
  teamAgents: Agent[];
  teamStats: {
    totalRequests: number;
    processingRequests: number;
    completedRequests: number;
    teamPerformance: Record<string, number>;
  };
  organizationRequests: ServiceRequest[];
}

// Données pour un admin
export interface AdminData extends ManagerData {
  role: 'ADMIN';
  organizations: Organization[];
  allAgents: Agent[];
  systemStats: DashboardStats;
  pendingValidations: Profile[];
}

// Données pour un super admin
export interface SuperAdminData extends AdminData {
  role: 'SUPER_ADMIN';
  countries: Country[];
  globalStats: {
    totalUsers: number;
    totalOrganizations: number;
    totalRequests: number;
    systemHealth: SystemHealth;
  };
}

// Type union pour toutes les données possibles
export type RoleData = UserData | AgentData | ManagerData | AdminData | SuperAdminData;
```

## Provider avec chargement conditionnel

```typescript
// src/providers/role-based-data-provider.tsx
import { api } from '@/trpc/server';
import { RoleDataContext } from './role-data-context';
import type { RoleData } from '@/types/role-data';

export async function RoleBasedDataProvider({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();
  const userRole = session?.user?.role || 'USER';

  // Charger les données en fonction du rôle
  const roleData = await loadDataForRole(userRole, session.user.id);

  return (
    <RoleDataContext.Provider value={roleData}>
      {children}
    </RoleDataContext.Provider>
  );
}

async function loadDataForRole(
  role: UserRole,
  userId: string
): Promise<RoleData> {
  // Données de base pour tous
  const baseDataPromises = [
    api.user.getCurrent(),
    api.profile.getFullProfile(),
    api.notifications.getAll(),
  ];

  switch (role) {
    case 'USER':
      return loadUserData(userId, baseDataPromises);

    case 'AGENT':
      return loadAgentData(userId, baseDataPromises);

    case 'MANAGER':
      return loadManagerData(userId, baseDataPromises);

    case 'ADMIN':
      return loadAdminData(userId, baseDataPromises);

    case 'SUPER_ADMIN':
      return loadSuperAdminData(userId, baseDataPromises);

    default:
      return loadUserData(userId, baseDataPromises);
  }
}

async function loadUserData(
  userId: string,
  basePromises: Promise<any>[]
): Promise<UserData> {
  const [
    user,
    profile,
    notifications,
    requests,
    appointments,
    children,
    documents,
    services,
    stats
  ] = await Promise.all([
    ...basePromises,
    api.services.getUserRequests(),
    api.appointments.getUserAppointments(),
    api.profile.getChildren(),
    api.documents.getUserDocuments(),
    api.services.getAvailable(),
    api.user.getCompleteStats()
  ]);

  return {
    role: 'USER',
    user,
    profile,
    notifications,
    requests,
    appointments,
    children,
    documents,
    availableServices: services,
    stats: {
      profileCompletion: stats.profileCompletion,
      unreadNotifications: notifications.filter(n => !n.read).length,
      pendingRequests: stats.pendingRequests,
      upcomingAppointments: stats.upcomingAppointments,
      documentsCount: stats.documentsCount,
      childrenCount: stats.childrenCount
    }
  };
}

async function loadAgentData(
  userId: string,
  basePromises: Promise<any>[]
): Promise<AgentData> {
  const [
    user,
    profile,
    notifications,
    assignedRequests,
    agentAppointments,
    assignedProfiles,
    organizationData,
    agentStats
  ] = await Promise.all([
    ...basePromises,
    api.requests.getAssignedToAgent({ agentId: userId }),
    api.appointments.getAgentSchedule({ agentId: userId }),
    api.profiles.getAssignedProfiles({ agentId: userId }),
    api.organizations.getAgentOrganization({ agentId: userId }),
    api.agents.getStats({ agentId: userId })
  ]);

  return {
    role: 'AGENT',
    user,
    profile,
    notifications,
    assignedRequests,
    agentAppointments,
    assignedProfiles,
    organizationData,
    stats: {
      profileCompletion: calculateProfileCompletion(profile),
      unreadNotifications: notifications.filter(n => !n.read).length
    },
    agentStats
  };
}

// ... Implémentations similaires pour Manager, Admin, SuperAdmin
```

## Hooks typés par rôle

```typescript
// src/hooks/use-role-data.ts
'use client';

import { useContext } from 'react';
import { RoleDataContext } from '@/providers/role-data-context';
import type {
  RoleData,
  UserData,
  AgentData,
  ManagerData,
  AdminData,
  SuperAdminData,
} from '@/types/role-data';

// Hook générique
export function useRoleData<T extends RoleData = RoleData>(): T {
  const context = useContext(RoleDataContext);
  if (!context) {
    throw new Error('useRoleData must be used within RoleBasedDataProvider');
  }
  return context as T;
}

// Hooks spécifiques par rôle avec type guards
export function useUserData(): UserData {
  const data = useRoleData();
  if (data.role !== 'USER') {
    throw new Error('useUserData can only be used by USER role');
  }
  return data;
}

export function useAgentData(): AgentData {
  const data = useRoleData();
  if (!['AGENT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(data.role)) {
    throw new Error('useAgentData requires at least AGENT role');
  }
  return data as AgentData;
}

export function useManagerData(): ManagerData {
  const data = useRoleData();
  if (!['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(data.role)) {
    throw new Error('useManagerData requires at least MANAGER role');
  }
  return data as ManagerData;
}

export function useAdminData(): AdminData {
  const data = useRoleData();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(data.role)) {
    throw new Error('useAdminData requires at least ADMIN role');
  }
  return data as AdminData;
}

export function useSuperAdminData(): SuperAdminData {
  const data = useRoleData();
  if (data.role !== 'SUPER_ADMIN') {
    throw new Error('useSuperAdminData requires SUPER_ADMIN role');
  }
  return data;
}

// Hook helper pour vérifier les permissions
export function useHasRole(requiredRoles: RoleData['role'][]): boolean {
  const data = useRoleData();
  return requiredRoles.includes(data.role);
}
```

## Hooks dérivés typés

```typescript
// src/hooks/role-specific-hooks.ts

// Pour les utilisateurs standard
export function useMyRequests() {
  const { requests } = useUserData();

  return {
    all: requests,
    pending: requests.filter((r) => r.status === 'PENDING'),
    processing: requests.filter((r) => r.status === 'PROCESSING'),
    completed: requests.filter((r) => r.status === 'COMPLETED'),
  };
}

export function useMyChildren() {
  const { children } = useUserData();

  return {
    children,
    count: children.length,
    hasChildren: children.length > 0,
  };
}

// Pour les agents
export function useAssignedRequests() {
  const { assignedRequests } = useAgentData();

  return {
    all: assignedRequests,
    urgent: assignedRequests.filter((r) => r.priority === 'URGENT'),
    todayAppointments: assignedRequests.filter(
      (r) => r.appointment?.date === new Date().toDateString(),
    ),
  };
}

export function useAgentSchedule() {
  const { agentAppointments } = useAgentData();

  const today = new Date();
  const todayStr = today.toDateString();

  return {
    today: agentAppointments.filter((a) => new Date(a.date).toDateString() === todayStr),
    thisWeek: agentAppointments.filter((a) => {
      const appointmentDate = new Date(a.date);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    }),
    upcoming: agentAppointments.filter((a) => new Date(a.date) >= today),
  };
}

// Pour les managers
export function useTeamPerformance() {
  const { teamStats, teamAgents } = useManagerData();

  return {
    agents: teamAgents,
    performance: teamStats.teamPerformance,
    topPerformer: Object.entries(teamStats.teamPerformance).sort(
      ([, a], [, b]) => b - a,
    )[0],
    averageProcessingTime:
      Object.values(teamStats.teamPerformance).reduce((a, b) => a + b, 0) /
      teamAgents.length,
  };
}

// Pour les admins
export function useOrganizationManagement() {
  const { organizations, allAgents } = useAdminData();

  return {
    organizations,
    totalAgents: allAgents.length,
    agentsByOrg: allAgents.reduce(
      (acc, agent) => {
        const orgId = agent.organizationId;
        if (!acc[orgId]) acc[orgId] = [];
        acc[orgId].push(agent);
        return acc;
      },
      {} as Record<string, Agent[]>,
    ),
  };
}
```

## Utilisation dans les pages

```typescript
// Page utilisateur standard
// src/app/(authenticated)/my-space/page.tsx
'use client';

import { useUserData, useMyRequests } from '@/hooks/role-specific-hooks';

export default function UserDashboard() {
  const { profile, stats, availableServices } = useUserData();
  const { pending, completed } = useMyRequests();

  return (
    <div>
      <h1>Bonjour {profile.firstName}</h1>
      <p>Vous avez {pending.length} demandes en cours</p>
      <p>Profile complété à {stats.profileCompletion}%</p>
      {/* Le TypeScript sait exactement quelles données sont disponibles */}
    </div>
  );
}
```

```typescript
// Page agent
// src/app/(authenticated)/dashboard/agent/page.tsx
'use client';

import { useAgentData, useAgentSchedule } from '@/hooks/role-specific-hooks';

export default function AgentDashboard() {
  const { agentStats, organizationData } = useAgentData();
  const { today, upcoming } = useAgentSchedule();

  return (
    <div>
      <h1>Tableau de bord Agent - {organizationData.name}</h1>
      <p>{today.length} rendez-vous aujourd'hui</p>
      <p>{agentStats.requestsToProcess} demandes à traiter</p>
      {/* TypeScript garantit que ces données existent pour un agent */}
    </div>
  );
}
```

```typescript
// Page admin avec accès à tout
// src/app/(authenticated)/dashboard/admin/page.tsx
'use client';

import { useAdminData, useOrganizationManagement } from '@/hooks/role-specific-hooks';

export default function AdminDashboard() {
  const { systemStats, pendingValidations } = useAdminData();
  const { organizations, agentsByOrg } = useOrganizationManagement();

  return (
    <div>
      <h1>Administration Système</h1>
      <p>{organizations.length} organisations</p>
      <p>{pendingValidations.length} profils en attente</p>
      {/* Accès complet aux données admin avec type safety */}
    </div>
  );
}
```

## Guards de rôle avec les hooks

```typescript
// src/components/guards/role-guard.tsx
'use client';

import { useHasRole } from '@/hooks/use-role-data';
import { redirect } from 'next/navigation';

interface RoleGuardProps {
  allowedRoles: RoleData['role'][];
  children: React.ReactNode;
  fallback?: string;
}

export function RoleGuard({
  allowedRoles,
  children,
  fallback = '/unauthorized'
}: RoleGuardProps) {
  const hasRole = useHasRole(allowedRoles);

  if (!hasRole) {
    redirect(fallback);
  }

  return <>{children}</>;
}

// Utilisation
<RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
  <AdminOnlyComponent />
</RoleGuard>
```

## Avantages de cette approche

1. **Type Safety** : Chaque rôle a exactement les données dont il a besoin, fortement typées
2. **Performance** : Seules les données pertinentes sont chargées
3. **Sécurité** : Impossible d'accéder aux données d'un autre rôle
4. **DX améliorée** : Autocomplétion et vérification des types
5. **Maintenance** : Facile d'ajouter de nouveaux rôles ou de modifier les permissions

Cette architecture garantit que chaque utilisateur n'a accès qu'aux données correspondant à son rôle, avec un typage TypeScript complet et une excellente expérience développeur.
