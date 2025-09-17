'use client';

import { useRoleDataContext } from '@/contexts/role-data-context';
import type { SessionUser, UserSession } from '@/types';
import type {
  RoleData,
  UserData,
  AgentData,
  ManagerData,
  AdminData,
  SuperAdminData,
} from '@/types/role-data';
import { useUser } from '@clerk/nextjs';
import type { UserRole } from '@prisma/client';

// Hook générique
export function useRoleData<T extends RoleData = RoleData>(): T | null {
  const context = useRoleDataContext();
  return context as T | null;
}

// Hooks spécifiques par rôle avec type guards
export function useUserData(): UserData {
  const data = useRoleData();
  if (data?.role !== 'USER') {
    throw new Error("Vous n'avez pas les permissions pour accéder à cette page.");
  }
  return data;
}

export function useAgentData(): AgentData {
  const data = useRoleData();
  if (data?.role !== 'AGENT') {
    throw new Error("Vous n'avez pas les permissions pour accéder à cette page.");
  }
  return data as AgentData;
}

export function useManagerData(): ManagerData {
  const data = useRoleData();
  if (data?.role !== 'MANAGER') {
    throw new Error("Vous n'avez pas les permissions pour accéder à cette page.");
  }
  return data as ManagerData;
}

export function useAdminData(): AdminData {
  const data = useRoleData();
  if (data?.role !== 'ADMIN') {
    throw new Error("Vous n'avez pas les permissions pour accéder à cette page.");
  }
  return data as AdminData;
}

export function useSuperAdminData(): SuperAdminData {
  const data = useRoleData();
  if (data?.role !== 'SUPER_ADMIN') {
    throw new Error("Vous n'avez pas les permissions pour accéder à cette page");
  }
  return data;
}

// Hook helper pour vérifier les permissions
export function useHasRole(requiredRoles: RoleData['role'][]): boolean {
  const data = useRoleData();
  if (!data) return false;
  return requiredRoles.includes(data.role);
}

// Hook pour vérifier si un rôle spécifique est possédé
export function useHasSpecificRole(role: RoleData['role']): boolean {
  const data = useRoleData();
  return data?.role === role;
}

// Hook pour obtenir le rôle actuel
export function useCurrentRole(): RoleData['role'] | null {
  const data = useRoleData();
  return data?.role || null;
}

// Hook pour vérifier si l'utilisateur est authentifié
export function useIsAuthenticated(): boolean {
  const data = useRoleData();
  return data !== null;
}

export function useCurrentUser() {
  const user = useUser();
  const userData: {
    id: string;
    profileId?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    roles?: UserRole[];
  } = {
    id: user.user?.id || '',
    email: user.user?.primaryEmailAddress?.emailAddress || null,
    name: user.user?.fullName,
    image: user.user?.imageUrl || null,
    roles: user.user?.publicMetadata?.roles as UserRole[],
    profileId: user.user?.publicMetadata?.profileId as string | undefined,
  };
  return {
    user: userData,
  };
}
