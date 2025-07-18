'use client';

import { useRoleDataContext } from '@/contexts/role-data-context';
import type {
  RoleData,
  UserData,
  AgentData,
  ManagerData,
  AdminData,
  SuperAdminData,
} from '@/types/role-data';

// Hook générique
export function useRoleData<T extends RoleData = RoleData>(): T | null {
  const context = useRoleDataContext();
  return context as T | null;
}

// Hooks spécifiques par rôle avec type guards
export function useUserData(): UserData {
  const data = useRoleData();
  if (!data || data.role !== 'USER') {
    throw new Error(
      'useUserData peut seulement être utilisé par un utilisateur avec le rôle USER',
    );
  }
  return data;
}

export function useAgentData(): AgentData {
  const data = useRoleData();
  if (!data || !['AGENT', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(data.role)) {
    throw new Error('useAgentData nécessite au minimum le rôle AGENT');
  }
  return data as AgentData;
}

export function useManagerData(): ManagerData {
  const data = useRoleData();
  if (!data || !['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(data.role)) {
    throw new Error('useManagerData nécessite au minimum le rôle MANAGER');
  }
  return data as ManagerData;
}

export function useAdminData(): AdminData {
  const data = useRoleData();
  if (!data || !['ADMIN', 'SUPER_ADMIN'].includes(data.role)) {
    throw new Error('useAdminData nécessite au minimum le rôle ADMIN');
  }
  return data as AdminData;
}

export function useSuperAdminData(): SuperAdminData {
  const data = useRoleData();
  if (!data || data.role !== 'SUPER_ADMIN') {
    throw new Error('useSuperAdminData nécessite le rôle SUPER_ADMIN');
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
