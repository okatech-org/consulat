import { Prisma, UserDocument } from '@prisma/client'

export type FullProfile = Prisma.ProfileGetPayload<{
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
            countryCode: true
          }
        }
      }
    },
    identityPicture: true,
    phone: true,
    notes: {
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }
  }
}>

export type FullUser = Prisma.UserGetPayload<{
  include: {
    profile: true
    phone: true
  }
}>

export type ProfileKey = keyof FullProfile

export type AppUserDocument = Omit<UserDocument, 'metadata'> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null
}

// Types pour les champs du profil
export interface ProfileField {
  key: string
  label: string
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'address'
  category: 'basic' | 'contact' | 'family' | 'professional'
  required?: boolean
}

// Définition des champs du profil
export const profileFields: ProfileField[] = [
  // Informations de base
  {
    key: 'firstName',
    label: 'first_name',
    type: 'text',
    category: 'basic',
    required: true
  },
  {
    key: 'lastName',
    label: 'last_name',
    type: 'text',
    category: 'basic',
    required: true
  },
  {
    key: 'birthDate',
    label: 'birth_date',
    type: 'date',
    category: 'basic',
    required: true
  },
  {
    key: 'birthPlace',
    label: 'birth_place',
    type: 'text',
    category: 'basic',
    required: true
  },
  {
    key: 'nationality',
    label: 'nationality',
    type: 'text',
    category: 'basic',
    required: true
  },
  {
    key: 'gender',
    label: 'gender',
    type: 'select',
    category: 'basic',
    required: true
  },

  // Contact
  {
    key: 'email',
    label: 'email',
    type: 'email',
    category: 'contact'
  },
  {
    key: 'phone',
    label: 'phone',
    type: 'phone',
    category: 'contact'
  },
  {
    key: 'address',
    label: 'address',
    type: 'address',
    category: 'contact',
    required: true
  },

  // Famille
  {
    key: 'maritalStatus',
    label: 'marital_status',
    type: 'select',
    category: 'family',
    required: true
  },
  {
    key: 'fatherFullName',
    label: 'father_name',
    type: 'text',
    category: 'family',
    required: true
  },
  {
    key: 'motherFullName',
    label: 'mother_name',
    type: 'text',
    category: 'family',
    required: true
  },
  {
    key: 'spouseFullName',
    label: 'spouse_name',
    type: 'text',
    category: 'family'
  },

  // Professionnel
  {
    key: 'workStatus',
    label: 'work_status',
    type: 'select',
    category: 'professional',
    required: true
  },
  {
    key: 'profession',
    label: 'profession',
    type: 'text',
    category: 'professional'
  },
  {
    key: 'employer',
    label: 'employer',
    type: 'text',
    category: 'professional'
  },
  {
    key: 'employerAddress',
    label: 'work_address',
    type: 'text',
    category: 'professional'
  }
]