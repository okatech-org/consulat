import {
  OrganizationType,
  OrganizationStatus,
  Country,
  User,
  ServiceCategory,
  Prisma,
} from '@prisma/client';
import { ConsularServiceListingItem } from '@/types/consular-service';
import { CountryListingItem } from '@/types/country';

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  type: OrganizationType;
  status: OrganizationStatus;
  countries: Country[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> | null;
  services: ConsularServiceListingItem[] | null;
  adminUser: User | null;
  agents: User[] | null;
  createdAt: Date;
  updatedAt: Date;

  _count: {
    services: number;
  };
}

export type OrganizationListingItem = {
  id: string;
  name: string;
  type: OrganizationType;
  status: OrganizationStatus;
  logo: string | null;
  countries: Country[];
  _count: {
    services: number;
  };
};

export type OrganizationAgents = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  linkedCountries: CountryListingItem[];
  serviceCategories: ServiceCategory[];
};

// Base includes pour une organisation
export const BaseOrganizationInclude = {
  include: {
    countries: true,
    _count: {
      select: {
        services: true,
      },
    },
  },
} as const;

// Includes complet pour une organisation
export const FullOrganizationInclude = {
  include: {
    ...BaseOrganizationInclude.include,
    services: {
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        isActive: true,
        organizationId: true,
        countryCode: true,
        phoneNumber: true,
      },
    },
    agents: {
      include: {
        linkedCountries: true,
      },
    },
    adminUser: true,
  },
} as const;

// Type pour une organisation de base
export type BaseOrganization = Prisma.OrganizationGetPayload<
  typeof BaseOrganizationInclude
>;

// Type pour une organisation complète
export type FullOrganization = Prisma.OrganizationGetPayload<
  typeof FullOrganizationInclude
>;

// Fonction helper pour créer un include personnalisé
export function createOrganizationInclude<
  T extends keyof typeof FullOrganizationInclude.include,
>(fields: T[]) {
  return {
    include: Object.fromEntries(
      fields.map((field) => [field, FullOrganizationInclude.include[field]]),
    ),
  } as const;
}

// Type helper pour une organisation avec des includes spécifiques
export type OrganizationWithIncludes<
  T extends keyof typeof FullOrganizationInclude.include,
> = Prisma.OrganizationGetPayload<ReturnType<typeof createOrganizationInclude<T>>>;

// Types pour les filtres de recherche
export interface OrganizationFilters {
  search?: string;
  status?: OrganizationStatus[];
  type?: OrganizationType[];
  countryId?: string;
}

// Type pour les résultats de recherche paginés
export interface PaginatedOrganizations {
  items: BaseOrganization[];
  total: number;
  page: number;
  limit: number;
}

// Ajout des includes pour les agents
export const BaseAgentInclude = {
  include: {
    linkedCountries: {
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        flag: true,
      },
    },
  },
} as const;

export const FullAgentInclude = {
  include: {
    ...BaseAgentInclude.include,
    serviceCategories: true,
    organization: {
      select: {
        id: true,
        name: true,
        type: true,
      },
    },
  },
} as const;

// Types pour les agents
export type BaseAgent = Prisma.UserGetPayload<typeof BaseAgentInclude>;
export type FullAgent = Prisma.UserGetPayload<typeof FullAgentInclude>;

// Helper pour créer des includes personnalisés pour les agents
export function createAgentInclude<T extends keyof typeof FullAgentInclude.include>(
  fields: T[],
) {
  return {
    include: Object.fromEntries(
      fields.map((field) => [field, FullAgentInclude.include[field]]),
    ),
  } as const;
}

// Type helper pour les agents avec des includes spécifiques
export type AgentWithIncludes<T extends keyof typeof FullAgentInclude.include> =
  Prisma.UserGetPayload<ReturnType<typeof createAgentInclude<T>>>;
