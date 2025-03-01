import {
  ParentalAuthority as PrismaParentalAuthority,
  ParentalRole,
  Prisma,
} from '@prisma/client';

// Params pour la création d'une autorité parentale
export interface CreateParentalAuthorityParams {
  profileId: string; // ID du profil enfant
  parentUserId: string; // ID de l'utilisateur parent
  role: ParentalRole;
  isActive?: boolean;
}

// Type de base pour une autorité parentale
export type BaseParentalAuthority = PrismaParentalAuthority;

// Include pour récupérer les informations de base
export const BaseParentalAuthorityInclude = {
  include: {
    profile: {
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
    parentUsers: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    },
  },
} as const;

// Type avec les relations de base
export type ParentalAuthorityWithBasicRelations = Prisma.ParentalAuthorityGetPayload<
  typeof BaseParentalAuthorityInclude
>;

// Include pour récupérer toutes les informations
export const FullParentalAuthorityInclude = {
  include: {
    profile: {
      include: {
        user: {
          select: {
            id: true,
            email: true,
            image: true,
            name: true,
          },
        },
        phone: true,
        address: true,
      },
    },
    parentUsers: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
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

// Type avec toutes les relations
export type ParentalAuthorityWithFullRelations = Prisma.ParentalAuthorityGetPayload<
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

// Type pour la mise à jour
export interface UpdateParentalAuthorityParams {
  id: string;
  isActive?: boolean;
  role?: ParentalRole;
}
