import { Prisma } from '@prisma/client';

// Base includes pour une demande de service
export const BaseServiceRequestInclude = {
  include: {
    submittedBy: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    },
    service: true,
    organization: true,
  },
} as const;

// Includes complet pour une demande de service
export const FullServiceRequestInclude = {
  include: {
    ...BaseServiceRequestInclude.include,
    documents: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    notes: {
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    messages: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc' as const,
      },
    },
    appointment: {
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    },
  },
} as const;

// Type pour une demande de service de base
export type BaseServiceRequest = Prisma.ServiceRequestGetPayload<
  typeof BaseServiceRequestInclude
>;

// Type pour une demande de service complète
export type FullServiceRequest = Prisma.ServiceRequestGetPayload<
  typeof FullServiceRequestInclude
>;

// Fonction helper pour créer un include personnalisé
export function createServiceRequestInclude<
  T extends keyof typeof FullServiceRequestInclude.include,
>(fields: T[]) {
  return {
    include: Object.fromEntries(
      fields.map((field) => [field, FullServiceRequestInclude.include[field]]),
    ),
  } as const;
}

// Type helper pour une demande de service avec des includes spécifiques
export type ServiceRequestWithIncludes<
  T extends keyof typeof FullServiceRequestInclude.include,
> = Prisma.ServiceRequestGetPayload<ReturnType<typeof createServiceRequestInclude<T>>>;

// Exemple d'utilisation:
// const documentsInclude = createServiceRequestInclude(['documents', 'messages']);
// type ServiceRequestWithDocuments = ServiceRequestWithIncludes<'documents' | 'messages'>;
