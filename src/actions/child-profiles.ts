import { PrismaClient, ProfileCategory, ParentalRole } from '@prisma/client';
import { FullProfileInclude } from '@/types/profile';
import { createParentalAuthority } from './parental-authority';
import { ChildCompleteFormData } from '@/schemas/child-registration';
import auth from '@/i18n/messages/fr/auth';
import { checkAuth } from '@/lib/auth/action';

// Instance de Prisma
const prisma = new PrismaClient();

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
export async function createChildProfile(data: ChildCompleteFormData) {
  // 1. Vérifier que le parent existe
  const { user: parentUser } = await checkAuth();

  if (!parentUser) {
    throw new Error('Utilisateur parent introuvable');
  }

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
