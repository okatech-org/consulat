import { Prisma, ParentalRole } from '@prisma/client';

// Base includes pour l'autorité parentale
export const BaseParentalAuthorityInclude = {
  profile: {
    include: {
      user: {
        select: {
          id: true,
          email: true,
          image: true,
        },
      },
    },
  },
  parentUsers: {
    select: {
      id: true,
      email: true,
      image: true,
      name: true,
    },
  },
} as const;

// Includes complet pour l'autorité parentale
export const FullParentalAuthorityInclude = {
  profile: {
    include: {
      user: true,
      address: true,
      requestsFor: {
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
      parentAuthorities: true,
    },
  },
} as const;

// Type pour une autorité parentale de base
export type BaseParentalAuthority = Prisma.ParentalAuthorityGetPayload<{
  include: typeof BaseParentalAuthorityInclude;
}>;

// Type pour une autorité parentale complète
export type FullParentalAuthority = Prisma.ParentalAuthorityGetPayload<{
  include: typeof FullParentalAuthorityInclude;
}>;

// Types pour les créations et mises à jour
export interface CreateParentalAuthorityParams {
  profileId: string;
  parentUserId: string;
  role: ParentalRole;
  isActive?: boolean;
}

export interface UpdateParentalAuthorityParams {
  role?: ParentalRole;
  isActive?: boolean;
}
