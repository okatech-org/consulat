import { Prisma, UserDocument } from '@prisma/client';

// Base includes pour un profil
export const BaseProfileInclude = {
  include: {
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    },
    organization: true,
  },
} as const;

// Includes complet pour un profil avec tous les documents
export const FullProfileInclude = {
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    },
    phone: true,
    emergencyContact: {
      include: {
        phone: true,
      },
    },
    address: true,
    addressInGabon: true,
    passport: true,
    birthCertificate: true,
    residencePermit: true,
    addressProof: true,
    identityPicture: true,
  },
} as const;

export const FullUserInclude = {
  include: {
    profile: true,
    phone: true,
    country: true,
    notifications: true,
  },
} as const;

// Type pour un profil de base
export type BaseProfile = Prisma.ProfileGetPayload<typeof BaseProfileInclude>;

// Type pour un profil complet
export type FullProfile = Prisma.ProfileGetPayload<typeof FullProfileInclude>;

// Fonction helper pour créer un include personnalisé
export function createProfileInclude<T extends keyof typeof FullProfileInclude.include>(
  fields: T[],
) {
  return {
    include: Object.fromEntries(
      fields.map((field) => [field, FullProfileInclude.include[field]]),
    ),
  } as const;
}

// Type helper pour un profil avec des includes spécifiques
export type ProfileWithIncludes<T extends keyof typeof FullProfileInclude.include> =
  Prisma.ProfileGetPayload<ReturnType<typeof createProfileInclude<T>>>;

// Exemple d'utilisation:
// const documentsInclude = createProfileInclude(['passport', 'birthCertificate', 'residencePermit']);
// type ProfileWithDocuments = ProfileWithIncludes<'passport' | 'birthCertificate' | 'residencePermit'>;

export type FullUser = Prisma.UserGetPayload<typeof FullUserInclude>;

export type ProfileKey = keyof FullProfile;

export type AppUserDocument = Omit<UserDocument, 'metadata'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
};

// Types pour les champs du profil
export interface ProfileField {
  key: ProfileKey;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'address';
  category: 'basic' | 'contact' | 'family' | 'professional';
  required?: boolean;
}

// Définition des champs du profil
export const profileFields: ProfileField[] = [
  // Informations de base
  {
    key: 'firstName',
    type: 'text',
    category: 'basic',
    required: true,
  },
  {
    key: 'lastName',
    type: 'text',
    category: 'basic',
    required: true,
  },
  {
    key: 'birthDate',
    type: 'date',
    category: 'basic',
    required: true,
  },
  {
    key: 'birthPlace',
    type: 'text',
    category: 'basic',
    required: true,
  },
  {
    key: 'nationality',
    type: 'text',
    category: 'basic',
    required: true,
  },
  {
    key: 'gender',
    type: 'select',
    category: 'basic',
    required: true,
  },

  // Contact
  {
    key: 'email',
    type: 'email',
    category: 'contact',
  },
  {
    key: 'phone',
    type: 'phone',
    category: 'contact',
  },
  {
    key: 'address',
    type: 'address',
    category: 'contact',
    required: true,
  },

  // Famille
  {
    key: 'maritalStatus',
    type: 'select',
    category: 'family',
    required: true,
  },
  {
    key: 'fatherFullName',
    type: 'text',
    category: 'family',
    required: true,
  },
  {
    key: 'motherFullName',
    type: 'text',
    category: 'family',
    required: true,
  },
  {
    key: 'spouseFullName',
    type: 'text',
    category: 'family',
  },

  // Professionnel
  {
    key: 'workStatus',
    type: 'select',
    category: 'professional',
    required: true,
  },
  {
    key: 'profession',
    type: 'text',
    category: 'professional',
  },
  {
    key: 'employer',
    type: 'text',
    category: 'professional',
  },
  {
    key: 'employerAddress',
    type: 'text',
    category: 'professional',
  },
];
