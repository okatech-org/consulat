import { ROLES } from './roles';
import type { ResourceType } from './types';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { UserRole } from '@/convex/lib/constants';
import type { UserData } from '@/convex/lib/types';

export function hasPermission<Resource extends keyof ResourceType>(
  user: UserData,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): boolean {
  return (
    user?.roles.some((role) => {
      const permission = ROLES[role as UserRole]?.[resource]?.[action];

      if (permission == null) return false;

      if (typeof permission === 'boolean') return permission;
      return data != null && permission(user, data);
    }) ?? false
  );
}

export function assertPermission<Resource extends keyof ResourceType>(
  user: UserData,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): void {
  if (!hasPermission(user, resource, action, data)) {
    throw new Error(
      `User ${user?._id} does not have permission to ${action} ${resource}`,
    );
  }
}

// Middleware pour les Server Actions
export function withPermission<Resource extends keyof ResourceType, T>(
  resource: Resource,
  action: ResourceType[Resource]['action'],
  callback: (user: UserData, data?: ResourceType[Resource]['dataType']) => Promise<T>,
) {
  return async (
    user: UserData,
    data?: ResourceType[Resource]['dataType'],
  ): Promise<T> => {
    assertPermission(user, resource, action, data);
    return callback(user, data);
  };
}

// Hook pour les composants React
export function usePermission<Resource extends keyof ResourceType>(
  user: UserData,
  resource: Resource,
  action: ResourceType[Resource]['action'],
  data?: ResourceType[Resource]['dataType'],
): boolean {
  return hasPermission(user, resource, action, data);
}

// Nouvelle fonction utilitaire pour vérifier si un utilisateur a un rôle spécifique
export function hasRole(user: UserData, role: UserRole): boolean {
  if (!user?.roles) return false;
  return user.roles.includes(role);
}

// Nouvelle fonction utilitaire pour vérifier si un utilisateur a l'un des rôles spécifiés
export function hasAnyRole(user: UserData, roles: UserRole[]): boolean {
  if (!user?.roles || !roles) return false;
  return user.roles.some((role) => roles.includes(role));
}

// Nouvelle fonction utilitaire pour vérifier si un utilisateur a tous les rôles spécifiés
export function hasAllRoles(user: UserData, roles: UserRole[]): boolean {
  if (!user?.roles) return false;
  return user.roles.every((role) => roles.includes(role as UserRole));
}

type Props = {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGuard({ roles, children, fallback }: Readonly<Props>) {
  const { user } = useCurrentUser();

  if (!user) {
    return fallback ?? undefined;
  }

  if (!hasAnyRole(user, roles)) {
    return fallback ?? undefined;
  }

  return <>{children}</>;
}

type ServerRoleGuardProps = {
  roles: UserRole[];
  user?: UserData;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function ServerRoleGuard({
  roles,
  user,
  children,
  fallback,
}: Readonly<ServerRoleGuardProps>) {
  if (!user) {
    return fallback ?? undefined;
  }

  if (!hasAnyRole(user, roles)) {
    return fallback ?? undefined;
  }

  return <>{children}</>;
}

type PermissionGuardProps<Resource extends keyof ResourceType> = {
  user: UserData;
  resource: Resource;
  action: ResourceType[Resource]['action'];
  data?: ResourceType[Resource]['dataType'];
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

export function PermissionGuard<Resource extends keyof ResourceType>({
  user,
  resource,
  action,
  data,
  fallback,
  children,
}: Readonly<PermissionGuardProps<Resource>>) {
  if (!user) {
    return fallback ?? undefined;
  }

  if (!hasPermission(user, resource, action, data)) {
    return fallback ?? undefined;
  }

  return children;
}
