import { PrismaClient, ProfileCategory } from '@prisma/client';
import {
  FullParentalAuthorityInclude,
  type CreateParentalAuthorityParams,
  type UpdateParentalAuthorityParams,
} from '@/types/parental-authority';

// Instance Prisma
const prisma = new PrismaClient();

/**
 * Crée une relation d'autorité parentale entre un utilisateur parent et un profil enfant
 */
export async function createParentalAuthority(data: CreateParentalAuthorityParams) {
  const { profileId, parentUserId, role, isActive = true } = data;

  // 1. Vérifier que le profil enfant existe et est bien un mineur
  const childProfile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!childProfile) {
    throw new Error('Profil enfant introuvable');
  }

  if (childProfile.category !== ProfileCategory.MINOR) {
    throw new Error('Le profil doit être un mineur');
  }

  // 2. Vérifier que l'utilisateur parent existe
  const parentUser = await prisma.user.findUnique({
    where: { id: parentUserId },
    include: { profile: true },
  });

  if (!parentUser) {
    throw new Error('Utilisateur parent introuvable');
  }

  // Vérifier que l'utilisateur parent a un profil adulte
  if (parentUser.profile && parentUser.profile.category !== ProfileCategory.ADULT) {
    throw new Error("L'utilisateur parent doit avoir un profil adulte");
  }

  // 3. Vérifier qu'il n'y a pas déjà une autorité parentale avec le même rôle pour ce profil
  const existingAuthority = await prisma.parentalAuthority.findFirst({
    where: {
      profileId,
      role,
    },
  });

  if (existingAuthority) {
    // Si l'autorité existe mais que cet utilisateur n'y est pas associé, l'ajouter
    return prisma.parentalAuthority.update({
      where: { id: existingAuthority.id },
      data: {
        parentUsers: {
          connect: { id: parentUserId },
        },
      },
      include: {
        ...FullParentalAuthorityInclude,
      },
    });
  }

  // 4. Créer une nouvelle autorité parentale
  return prisma.parentalAuthority.create({
    data: {
      profile: {
        connect: { id: profileId },
      },
      role,
      isActive,
      parentUsers: {
        connect: { id: parentUserId },
      },
    },
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Met à jour une relation d'autorité parentale
 */
export async function updateParentalAuthority(
  id: string,
  data: UpdateParentalAuthorityParams,
) {
  // Vérifier que l'autorité parentale existe
  const authority = await prisma.parentalAuthority.findUnique({
    where: { id },
  });

  if (!authority) {
    throw new Error('Autorité parentale introuvable');
  }

  // Mettre à jour l'autorité parentale
  return prisma.parentalAuthority.update({
    where: { id },
    data,
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Supprime une relation d'autorité parentale
 */
export async function deleteParentalAuthority(id: string) {
  // Vérifier que l'autorité parentale existe
  const authority = await prisma.parentalAuthority.findUnique({
    where: { id },
  });

  if (!authority) {
    throw new Error('Autorité parentale introuvable');
  }

  return prisma.parentalAuthority.delete({
    where: { id },
  });
}

/**
 * Ajoute un utilisateur parent à une autorité parentale existante
 */
export async function addParentUserToAuthority(
  authorityId: string,
  parentUserId: string,
) {
  // Vérifier que l'autorité parentale existe
  const authority = await prisma.parentalAuthority.findUnique({
    where: { id: authorityId },
    include: { parentUsers: true },
  });

  if (!authority) {
    throw new Error('Autorité parentale introuvable');
  }

  // Vérifier que l'utilisateur parent existe
  const parentUser = await prisma.user.findUnique({
    where: { id: parentUserId },
  });

  if (!parentUser) {
    throw new Error('Utilisateur parent introuvable');
  }

  // Vérifier si l'utilisateur est déjà associé à cette autorité
  if (authority.parentUsers.some((user) => user.id === parentUserId)) {
    throw new Error('Cet utilisateur est déjà associé à cette autorité parentale');
  }

  // Ajouter l'utilisateur parent à l'autorité parentale
  return prisma.parentalAuthority.update({
    where: { id: authorityId },
    data: {
      parentUsers: {
        connect: { id: parentUserId },
      },
    },
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Supprime un utilisateur parent d'une autorité parentale
 */
export async function removeParentUserFromAuthority(
  authorityId: string,
  parentUserId: string,
) {
  // Vérifier que l'autorité parentale existe
  const authority = await prisma.parentalAuthority.findUnique({
    where: { id: authorityId },
    include: { parentUsers: true },
  });

  if (!authority) {
    throw new Error('Autorité parentale introuvable');
  }

  // Vérifier que l'utilisateur est bien associé à cette autorité
  if (!authority.parentUsers.some((user) => user.id === parentUserId)) {
    throw new Error("Cet utilisateur n'est pas associé à cette autorité parentale");
  }

  // Vérifier qu'il y a au moins un autre parent associé avant de supprimer
  if (authority.parentUsers.length < 2) {
    throw new Error('Impossible de supprimer le seul parent associé à cette autorité');
  }

  // Supprimer l'utilisateur parent de l'autorité parentale
  return prisma.parentalAuthority.update({
    where: { id: authorityId },
    data: {
      parentUsers: {
        disconnect: { id: parentUserId },
      },
    },
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Récupère une relation d'autorité parentale par ID
 */
export async function getParentalAuthorityById(id: string) {
  return prisma.parentalAuthority.findUnique({
    where: { id },
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Récupère toutes les relations d'autorité parentale d'un utilisateur parent
 */
export async function getParentalAuthoritiesByParentUser(parentUserId: string) {
  // Vérifier que l'utilisateur parent existe
  const parentUser = await prisma.user.findUnique({
    where: { id: parentUserId },
  });

  if (!parentUser) {
    throw new Error('Utilisateur parent introuvable');
  }

  // Récupérer les relations où cet utilisateur est un parent
  return prisma.parentalAuthority.findMany({
    where: {
      parentUsers: {
        some: {
          id: parentUserId,
        },
      },
      isActive: true,
    },
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Récupère toutes les relations d'autorité parentale pour un profil enfant
 */
export async function getParentalAuthoritiesByChild(profileId: string) {
  return prisma.parentalAuthority.findMany({
    where: {
      profileId,
      isActive: true,
    },
    include: {
      ...FullParentalAuthorityInclude,
    },
  });
}

/**
 * Vérifie si un utilisateur a l'autorité parentale sur un profil enfant
 */
export async function hasParentalAuthority(parentUserId: string, profileId: string) {
  // Vérifier si l'utilisateur parent existe
  const parentUser = await prisma.user.findUnique({
    where: { id: parentUserId },
  });

  if (!parentUser) {
    return false;
  }

  // Récupérer les autorités parentales du profil enfant où cet utilisateur est parent
  const authorities = await prisma.parentalAuthority.findMany({
    where: {
      profileId,
      parentUsers: {
        some: {
          id: parentUserId,
        },
      },
      isActive: true,
    },
  });

  return authorities.length > 0;
}
