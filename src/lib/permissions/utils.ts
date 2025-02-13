import { User, UserRole } from '@prisma/client';
import { ROLES } from './roles';
import { ResourceType } from './types';

export function hasPermission<Resource extends keyof ResourceType>(
  user: User,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): boolean {
  // Vérifie si l'un des rôles de l'utilisateur a la permission
  return user.roles.some((role) => {
    const permission = ROLES[role]?.[resource]?.[action];

    if (permission == null) return false;

    if (typeof permission === 'boolean') return permission;
    return data != null && permission(user, data);
  });
}

export function assertPermission<Resource extends keyof ResourceType>(
  user: User,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): void {
  if (!hasPermission(user, resource, action, data)) {
    throw new Error(`User ${user.id} does not have permission to ${action} ${resource}`);
  }
}

// Middleware pour les Server Actions
export function withPermission<Resource extends keyof ResourceType, T>(
  resource: Resource,
  action: ResourceType[Resource]['action'],
  callback: (user: User, data?: ResourceType[Resource]['dataType']) => Promise<T>,
) {
  return async (user: User, data?: ResourceType[Resource]['dataType']): Promise<T> => {
    assertPermission(user, resource, action, data);
    return callback(user, data);
  };
}

// Hook pour les composants React
export function usePermission<Resource extends keyof ResourceType>(
  user: User,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): boolean {
  return hasPermission(user, resource, action, data);
}

// Nouvelle fonction utilitaire pour vérifier si un utilisateur a un rôle spécifique
export function hasRole(user: User, role: UserRole): boolean {
  return user.roles.includes(role);
}

// Nouvelle fonction utilitaire pour vérifier si un utilisateur a l'un des rôles spécifiés
export function hasAnyRole(user: User, roles: UserRole[]): boolean {
  return user.roles.some((role) => roles.includes(role));
}

// Nouvelle fonction utilitaire pour vérifier si un utilisateur a tous les rôles spécifiés
export function hasAllRoles(user: User, roles: UserRole[]): boolean {
  return roles.every((role) => user.roles.includes(role));
}
