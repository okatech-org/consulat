import { Prisma, ParentalRole, RequestStatus } from '@prisma/client';

// Interface commune pour les données nécessaires à la carte enfant
export interface ChildProfileCardData {
  id: string;
  role: ParentalRole;
  isActive: boolean;
  createdAt: Date;
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    birthDate: Date | null;
    nationality: string | null;
    status: RequestStatus;
    user: {
      id: string;
      image: string | null;
    } | null;
  };
}

// Sélecteur optimisé pour la liste des enfants (dashboard)
export const DashboardChildProfileSelect = {
  profile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      nationality: true,
      status: true,
      user: {
        select: {
          id: true,
          image: true,
        },
      },
    },
  },
  id: true,
  role: true,
  isActive: true,
  createdAt: true,
} as const;

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

// Type pour une autorité parentale optimisée pour le dashboard
export type DashboardChildProfile = Prisma.ParentalAuthorityGetPayload<{
  select: typeof DashboardChildProfileSelect;
}>;

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
