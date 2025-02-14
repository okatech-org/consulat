import {
  Prisma,
  RequestStatus,
  ServicePriority,
  RequestActionType,
} from '@prisma/client';

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
    service: {
      select: {
        id: true,
        name: true,
        category: true,
        requiredDocuments: true,
        optionalDocuments: true,
      },
    },
    organization: {
      select: {
        id: true,
        name: true,
        type: true,
      },
    },
  },
} as const;

// Includes complet pour une demande de service
export const FullServiceRequestInclude = {
  include: {
    ...BaseServiceRequestInclude.include,
    assignedTo: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        serviceCategories: true,
        linkedCountries: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    },
    documents: {
      include: {
        validatedBy: {
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
            roles: true,
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
    actions: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            roles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc' as const,
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

// Type helper pour une demande avec des includes spécifiques
export type ServiceRequestWithIncludes<
  T extends keyof typeof FullServiceRequestInclude.include,
> = Prisma.ServiceRequestGetPayload<ReturnType<typeof createServiceRequestInclude<T>>>;

// Types pour les filtres de recherche
export interface ServiceRequestFilters {
  search?: string;
  status?: RequestStatus[];
  priority?: ServicePriority[];
  category?: string[];
  assignedToId?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
}

// Type pour les résultats de recherche paginés
export interface PaginatedServiceRequests {
  items: FullServiceRequest[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Type pour les actions sur les demandes
export interface ServiceRequestAction {
  type: RequestActionType;
  requestId: string;
  userId: string;
  data?: Record<string, unknown>;
}

// Type pour les statistiques des demandes
export interface ServiceRequestStats {
  total: number;
  byStatus: Record<RequestStatus, number>;
  byPriority: Record<ServicePriority, number>;
  averageProcessingTime: number;
  completedToday: number;
  pendingUrgent: number;
}
