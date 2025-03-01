'use server';

import {
  PrismaClient,
  ProfileCategory,
  ParentalRole,
  Gender,
  Profile,
} from '@prisma/client';
import { FullProfileInclude } from '@/types/profile';
import { createParentalAuthority } from './parental-authority';
import { tryCatch } from '@/lib/utils';
import { auth } from '@/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ROUTES } from '@/schemas/routes';

// Instance de Prisma
const prisma = new PrismaClient();

// Schéma de validation pour la création d'un profil enfant
const createChildProfileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit comporter au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  gender: z.nativeEnum(Gender, {
    required_error: 'Le genre est requis',
  }),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  birthPlace: z.string().min(2, 'Le lieu de naissance est requis'),
  birthCountry: z.string().min(2, 'Le pays de naissance est requis'),
  nationality: z.string().min(2, 'La nationalité est requise'),
  parentRole: z.nativeEnum(ParentalRole, {
    required_error: 'Votre lien parental est requis',
  }),
});

export type CreateChildProfileActionInput = z.infer<typeof createChildProfileSchema>;

export type CreateChildProfileActionResult = {
  success: boolean;
  error?: string;
  profile?: Record<string, any>;
};

/**
 * Server Action pour créer un profil enfant
 * Utilise le wrapper tryCatch pour la gestion des erreurs
 */
export async function createChildProfileAction(
  input: CreateChildProfileActionInput,
): Promise<CreateChildProfileActionResult> {
  // 1. Vérifier l'authentification de l'utilisateur
  const session = await auth();
  if (!session?.user) {
    return {
      success: false,
      error: 'Vous devez être connecté pour créer un profil enfant',
    };
  }

  // 2. Valider les données d'entrée
  try {
    createChildProfileSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: 'Les données fournies sont invalides',
    };
  }

  // Vérifier que l'utilisateur a un ID
  if (!session.user.id) {
    return {
      success: false,
      error: 'Utilisateur invalide',
    };
  }

  // 3. Utiliser le wrapper tryCatch pour la logique principale
  const { error, data } = await tryCatch(async () => {
    // Utiliser la fonction existante pour créer le profil
    const profile = await createChildProfile({
      firstName: input.firstName,
      lastName: input.lastName,
      gender: input.gender,
      birthDate: input.birthDate,
      birthPlace: input.birthPlace,
      birthCountry: input.birthCountry,
      nationality: input.nationality,
      parentUserId: session.user.id,
      parentRole: input.parentRole,
      // Champs obligatoires selon l'interface mais qui peuvent être vides pour l'instant
      passportNumber: '',
      passportIssueDate: new Date(),
      passportExpiryDate: new Date(),
      passportIssueAuthority: '',
    });

    // Invalider le cache pour la page des enfants
    revalidatePath(ROUTES.user.children);

    return profile;
  });

  // 4. Retourner le résultat
  if (error) {
    console.error('Erreur lors de la création du profil enfant:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    };
  }

  return {
    success: true,
    profile: data || undefined,
  };
}

interface CreateChildProfileParams {
  // Informations de l'enfant
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  birthPlace: string;
  birthCountry: string;
  nationality: string;
  passportNumber: string;
  passportIssueDate: Date;
  passportExpiryDate: Date;
  passportIssueAuthority: string;

  // Informations du parent qui crée le profil
  parentUserId: string; // ID de l'utilisateur parent
  parentRole: ParentalRole;

  // Informations sur l'autre parent (optionnel)
  otherParentInfo?: {
    firstName: string;
    lastName: string;
    email?: string;
    userId?: string; // ID de l'utilisateur de l'autre parent
  };
}

/**
 * Crée un profil enfant et établit les relations parentales appropriées
 */
export async function createChildProfile(data: CreateChildProfileParams) {
  // 1. Vérifier que le parent existe
  const parentUser = await prisma.user.findUnique({
    where: { id: data.parentUserId },
    include: { profile: true },
  });

  if (!parentUser) {
    throw new Error('Utilisateur parent introuvable');
  }

  if (!parentUser.profile || parentUser.profile.category !== ProfileCategory.ADULT) {
    throw new Error('Le parent doit avoir un profil adulte');
  }

  // 2. Créer un utilisateur pour l'enfant (nécessaire pour la structure de l'application)
  // L'enfant mineur n'aura pas accès à son compte, mais aura un profil géré par ses parents
  const childUser = await prisma.user.create({
    data: {
      name: `${data.firstName} ${data.lastName}`,
      // Aucun email ou téléphone n'est défini pour un enfant mineur
    },
  });

  // 3. Créer le profil enfant
  const childProfile = await prisma.profile.create({
    data: {
      userId: childUser.id,
      category: ProfileCategory.MINOR,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace,
      birthCountry: data.birthCountry,
      nationality: data.nationality,
      passportNumber: data.passportNumber,
      passportIssueDate: data.passportIssueDate,
      passportExpiryDate: data.passportExpiryDate,
      passportIssueAuthority: data.passportIssueAuthority,
      // Informations familiales - renseignées automatiquement
      fatherFullName:
        data.parentRole === 'FATHER'
          ? `${parentUser.firstName || ''} ${parentUser.lastName || ''}`
          : data.otherParentInfo
            ? `${data.otherParentInfo.firstName} ${data.otherParentInfo.lastName}`
            : null,
      motherFullName:
        data.parentRole === 'MOTHER'
          ? `${parentUser.firstName || ''} ${parentUser.lastName || ''}`
          : data.otherParentInfo
            ? `${data.otherParentInfo.firstName} ${data.otherParentInfo.lastName}`
            : null,
    },
    include: FullProfileInclude.include,
  });

  // 4. Créer la relation d'autorité parentale pour le parent qui crée le profil
  await createParentalAuthority({
    profileId: childProfile.id,
    parentUserId: data.parentUserId,
    role: data.parentRole,
  });

  // 5. Si des informations sur l'autre parent sont fournies et qu'il a un compte, créer la relation
  if (data.otherParentInfo?.userId) {
    // Vérifier que l'autre parent existe
    const otherParentUser = await prisma.user.findUnique({
      where: { id: data.otherParentInfo.userId },
      include: { profile: true },
    });

    if (
      otherParentUser &&
      otherParentUser.profile &&
      otherParentUser.profile.category === ProfileCategory.ADULT
    ) {
      // Déterminer le rôle de l'autre parent (opposé au rôle du parent actuel)
      const otherParentRole = data.parentRole === 'FATHER' ? 'MOTHER' : 'FATHER';

      await createParentalAuthority({
        profileId: childProfile.id,
        parentUserId: data.otherParentInfo.userId,
        role: otherParentRole as ParentalRole,
      });
    }
  }

  return childProfile;
}

/**
 * Récupère tous les profils enfants associés à un parent
 */
export async function getChildProfilesByParent(parentUserId: string) {
  // Récupérer les autorités parentales où l'utilisateur est parent
  const parentalAuthorities = await prisma.parentalAuthority.findMany({
    where: {
      parentUsers: {
        some: {
          id: parentUserId,
        },
      },
      isActive: true,
    },
    include: {
      profile: {
        include: FullProfileInclude.include,
      },
    },
  });

  // Extraire les profils enfants des autorités parentales
  const childProfiles = parentalAuthorities.map((authority) => authority.profile);

  return childProfiles;
}

/**
 * Vérifie si un utilisateur a les droits pour accéder aux informations d'un enfant
 */
export async function canAccessChildProfile(
  parentUserId: string,
  childProfileId: string,
) {
  // Vérifier si l'utilisateur a une autorité parentale sur ce profil
  const authority = await prisma.parentalAuthority.findFirst({
    where: {
      profileId: childProfileId,
      parentUsers: {
        some: {
          id: parentUserId,
        },
      },
      isActive: true,
    },
  });

  return !!authority;
}
