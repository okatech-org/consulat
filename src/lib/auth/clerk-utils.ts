import { auth } from '@clerk/nextjs/server';
import { db } from '@/server/db';
import type { SessionUser } from '@/types';

/**
 * Récupère les données utilisateur complètes depuis la base de données
 * en utilisant l'ID utilisateur de Clerk
 */
export async function getCurrentUserFromClerk(): Promise<SessionUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        roles: true,
        profileId: true,
        assignedOrganizationId: true,
        organizationId: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user from Clerk ID:', error);
    return null;
  }
}

/**
 * Récupère les rôles de l'utilisateur actuel
 */
export async function getCurrentUserRoles(): Promise<string[]> {
  const user = await getCurrentUserFromClerk();
  return user?.roles || [];
}

/**
 * Vérifie si l'utilisateur actuel a un rôle spécifique
 */
export async function hasRole(role: string): Promise<boolean> {
  const roles = await getCurrentUserRoles();
  return roles.includes(role);
}

/**
 * Vérifie si l'utilisateur actuel a l'un des rôles spécifiés
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const userRoles = await getCurrentUserRoles();
  return roles.some((role) => userRoles.includes(role));
}
