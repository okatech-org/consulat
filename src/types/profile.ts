import { Prisma, UserDocument } from '@prisma/client';

export const FullProfileInclude = {
  include: {
    passport: true,
    birthCertificate: true,
    residencePermit: true,
    addressProof: true,
    address: true,
    addressInGabon: true,
    emergencyContact: {
      include: {
        phone: {
          select: {
            number: true,
            countryCode: true,
          },
        },
      },
    },
    identityPicture: true,
    phone: true,
    notes: {
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc' as any,
      },
    },
  },
};

export type FullProfile = Prisma.ProfileGetPayload<typeof FullProfileInclude>;

export type FullUser = Prisma.UserGetPayload<{
  include: {
    profile: true;
    phone: true;
  };
}>;

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
