import {
  OrganizationType,
  OrganizationStatus,
  Country,
  User,
  ServiceCategory,
  TimeSlot,
  Prisma,
} from '@prisma/client';
import { ConsularServiceListingItem } from '@/types/consular-service';
import { CountryListingItem } from '@/types/country';
import { PhoneValue } from '@/components/ui/phone-input';

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  type: OrganizationType;
  status: OrganizationStatus;
  countries: Country[];
  metadata: Record<string, unknown> | null;
  services: ConsularServiceListingItem[] | null;
  timeSlots: TimeSlot[] | null;
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
  phone: PhoneValue | null;
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
      },
    },
    agents: {
      include: {
        linkedCountries: true,
        phone: true,
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
