import { Prisma } from '@prisma/client';

// Base includes pour l'autorité parentale
export const BaseParentalAuthorityInclude = {
  include: {
    parentProfile: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            image: true,
          },
        },
      },
    },
    childProfile: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            image: true,
          },
        },
      },
    },
  },
} as const;

// Includes complet pour l'autorité parentale
export const FullParentalAuthorityInclude = {
  include: {
    parentProfile: {
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
        address: true,
      },
    },
    childProfile: {
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
        address: true,
      },
    },
    sharedRequests: {
      include: {
        service: true,
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    },
  },
} as const;

// Type pour une autorité parentale de base
export type BaseParentalAuthority = Prisma.ParentalAuthorityGetPayload<
  typeof BaseParentalAuthorityInclude
>;

// Type pour une autorité parentale complète
export type FullParentalAuthority = Prisma.ParentalAuthorityGetPayload<
  typeof FullParentalAuthorityInclude
>;

// Fonction helper pour créer un include personnalisé
export function createParentalAuthorityInclude<
  T extends keyof typeof FullParentalAuthorityInclude.include,
>(fields: T[]) {
  return {
    include: Object.fromEntries(
      fields.map((field) => [field, FullParentalAuthorityInclude.include[field]]),
    ),
  } as const;
}

// Type helper pour une autorité parentale avec des includes spécifiques
export type ParentalAuthorityWithIncludes<
  T extends keyof typeof FullParentalAuthorityInclude.include,
> = Prisma.ParentalAuthorityGetPayload<
  ReturnType<typeof createParentalAuthorityInclude<T>>
>;

// Types pour les créations et mises à jour
export interface CreateParentalAuthorityParams {
  parentProfileId: string;
  childProfileId: string;
  role: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN';
}

export interface UpdateParentalAuthorityParams {
  id: string;
  isActive?: boolean;
  role?: 'FATHER' | 'MOTHER' | 'LEGAL_GUARDIAN';
}
