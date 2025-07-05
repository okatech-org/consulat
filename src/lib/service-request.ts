import {
  Prisma,
  RequestStatus,
  ServicePriority,
  RequestActionType,
  ServiceCategory,
  type ConsularService,
  type User,
} from '@prisma/client';

// Base includes pour une demande de service
export const BaseServiceRequestInclude: {
  include: Prisma.ServiceRequestInclude;
} = {
  include: {
    submittedBy: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        documents: true,
      },
    },
    service: {
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        requiredDocuments: true,
        optionalDocuments: true,
        toGenerateDocuments: true,
        requiresAppointment: true,
        appointmentDuration: true,
        appointmentInstructions: true,
        deliveryAppointment: true,
        deliveryAppointmentDuration: true,
        deliveryAppointmentDesc: true,
        steps: true,
        isFree: true,
        price: true,
        currency: true,
        organizationId: true,
        processingMode: true,
        deliveryMode: true,
        proxyRequirements: true,
        postalRequirements: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        countryCode: true,
        Country: true,
        generateDocumentSettings: true,
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
export const FullServiceRequestInclude: {
  include: Prisma.ServiceRequestInclude;
} = {
  include: {
    ...BaseServiceRequestInclude.include,
    assignedTo: {
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        specializations: true,
        linkedCountries: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    },
    requiredDocuments: {
      include: {
        validatedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    },
    notes: {
      include: {
        author: {
          select: {
            id: true,
            image: true,
            name: true,
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
    },
    service: {
      include: {
        steps: true,
      },
    },
    appointments: {
      include: {
        location: true,
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
> & {
  service: ConsularService;
  submittedBy: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?: Record<string, any>;
};

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
  serviceCategory?: ServiceCategory[];
  assignedToId?: string[];
  organizationId?: string[];
  submittedById?: string[];
  createdAt?: Date;
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
