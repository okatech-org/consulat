import { User } from '@prisma/client';
import { ROLES } from './roles';
import { ResourceType } from './types';

export function hasPermission<Resource extends keyof ResourceType>(
  user: User,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): boolean {
  const permission = ROLES[user.role]?.[resource]?.[action];

  if (permission == null) return false;

  if (typeof permission === 'boolean') return permission;
  return data != null && permission(user, data);
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
