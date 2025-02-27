import { PrismaClient } from '@prisma/client';
import {
  BaseParentalAuthorityInclude,
  CreateParentalAuthorityParams,
  FullParentalAuthorityInclude,
  UpdateParentalAuthorityParams,
} from '@/types/parental-authority';
import { ProfileCategory } from '@prisma/client';

// Instance de Prisma
const prisma = new PrismaClient();

/**
 * Crée une nouvelle autorité parentale
 */
export async function createParentalAuthority(data: CreateParentalAuthorityParams) {
  // Vérifier si les profils existent et si les catégories sont correctes
  const [parentProfile, childProfile] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: data.parentProfileId },
    }),
    prisma.profile.findUnique({
      where: { id: data.childProfileId },
    }),
  ]);

  if (!parentProfile) {
    throw new Error('Profil parent introuvable');
  }

  if (!childProfile) {
    throw new Error('Profil enfant introuvable');
  }

  // Vérifier que le parent est bien un adulte
  if (parentProfile.category !== ProfileCategory.ADULT) {
    throw new Error('Le profil parent doit être un adulte');
  }

  // Vérifier que l'enfant est bien un mineur
  if (childProfile.category !== ProfileCategory.MINOR) {
    throw new Error('Le profil enfant doit être un mineur');
  }

  // Vérifier qu'il n'y a pas déjà une relation avec le même rôle
  const existingRelation = await prisma.parentalAuthority.findFirst({
    where: {
      parentProfileId: data.parentProfileId,
      childProfileId: data.childProfileId,
      role: data.role,
    },
  });

  if (existingRelation) {
    throw new Error('Cette relation parent-enfant existe déjà');
  }

  // Créer la relation
  return prisma.parentalAuthority.create({
    data: {
      parentProfileId: data.parentProfileId,
      childProfileId: data.childProfileId,
      role: data.role,
      isActive: true,
    },
    include: BaseParentalAuthorityInclude.include,
  });
}

/**
 * Met à jour une autorité parentale
 */
export async function updateParentalAuthority(data: UpdateParentalAuthorityParams) {
  const authority = await prisma.parentalAuthority.findUnique({
    where: { id: data.id },
  });

  if (!authority) {
    throw new Error('Autorité parentale introuvable');
  }

  return prisma.parentalAuthority.update({
    where: { id: data.id },
    data: {
      isActive: data.isActive,
      role: data.role,
    },
    include: BaseParentalAuthorityInclude.include,
  });
}

/**
 * Supprime une autorité parentale
 */
export async function deleteParentalAuthority(id: string) {
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
 * Récupère une autorité parentale par son ID
 */
export async function getParentalAuthorityById(id: string) {
  return prisma.parentalAuthority.findUnique({
    where: { id },
    include: FullParentalAuthorityInclude.include,
  });
}

/**
 * Récupère toutes les autorités parentales pour un parent donné
 */
export async function getParentalAuthoritiesByParent(parentProfileId: string) {
  return prisma.parentalAuthority.findMany({
    where: {
      parentProfileId,
      isActive: true,
    },
    include: BaseParentalAuthorityInclude.include,
  });
}

/**
 * Récupère toutes les autorités parentales pour un enfant donné
 */
export async function getParentalAuthoritiesByChild(childProfileId: string) {
  return prisma.parentalAuthority.findMany({
    where: {
      childProfileId,
      isActive: true,
    },
    include: BaseParentalAuthorityInclude.include,
  });
}

/**
 * Vérifie si un utilisateur a l'autorité parentale sur un enfant
 */
export async function hasParentalAuthority(
  parentProfileId: string,
  childProfileId: string,
) {
  const authority = await prisma.parentalAuthority.findFirst({
    where: {
      parentProfileId,
      childProfileId,
      isActive: true,
    },
  });

  return !!authority;
}
