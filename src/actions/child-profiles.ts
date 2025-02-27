import { PrismaClient, ProfileCategory, ParentalRole } from '@prisma/client';
import { FullProfileInclude } from '@/types/profile';
import { createParentalAuthority } from './parental-authority';

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
  parentProfileId: string;
  parentRole: ParentalRole;

  // Informations sur l'autre parent (optionnel)
  otherParentInfo?: {
    firstName: string;
    lastName: string;
    email?: string;
    profileId?: string; // Si l'autre parent a déjà un profil
  };
}

/**
 * Crée un profil enfant et établit les relations parentales appropriées
 */
export async function createChildProfile(data: CreateChildProfileParams) {
  // 1. Vérifier que le parent existe et est un adulte
  const parentProfile = await prisma.profile.findUnique({
    where: { id: data.parentProfileId },
    include: { user: true },
  });

  if (!parentProfile) {
    throw new Error('Profil parent introuvable');
  }

  if (parentProfile.category !== ProfileCategory.ADULT) {
    throw new Error('Le profil parent doit être un adulte');
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
          ? `${parentProfile.firstName} ${parentProfile.lastName}`
          : data.otherParentInfo
            ? `${data.otherParentInfo.firstName} ${data.otherParentInfo.lastName}`
            : null,
      motherFullName:
        data.parentRole === 'MOTHER'
          ? `${parentProfile.firstName} ${parentProfile.lastName}`
          : data.otherParentInfo
            ? `${data.otherParentInfo.firstName} ${data.otherParentInfo.lastName}`
            : null,
    },
    include: FullProfileInclude.include,
  });

  // 4. Créer la relation parentale pour le parent qui crée le profil
  await createParentalAuthority({
    parentProfileId: data.parentProfileId,
    childProfileId: childProfile.id,
    role: data.parentRole,
  });

  // 5. Si des informations sur l'autre parent sont fournies et qu'il a un profil, créer la relation
  if (data.otherParentInfo?.profileId) {
    // Vérifier que l'autre parent existe et est un adulte
    const otherParentProfile = await prisma.profile.findUnique({
      where: { id: data.otherParentInfo.profileId },
    });

    if (otherParentProfile && otherParentProfile.category === ProfileCategory.ADULT) {
      // Déterminer le rôle de l'autre parent (opposé au rôle du parent actuel)
      const otherParentRole = data.parentRole === 'FATHER' ? 'MOTHER' : 'FATHER';

      await createParentalAuthority({
        parentProfileId: data.otherParentInfo.profileId,
        childProfileId: childProfile.id,
        role: otherParentRole as ParentalRole,
      });
    }
  }

  return childProfile;
}

/**
 * Récupère tous les profils enfants associés à un parent
 */
export async function getChildProfilesByParent(parentProfileId: string) {
  const parentalAuthorities = await prisma.parentalAuthority.findMany({
    where: {
      parentProfileId,
      isActive: true,
    },
    include: {
      childProfile: {
        include: FullProfileInclude.include,
      },
    },
  });

  return parentalAuthorities.map((authority) => authority.childProfile);
}

/**
 * Vérifie si un utilisateur a les droits pour accéder aux informations d'un enfant
 */
export async function canAccessChildProfile(
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
