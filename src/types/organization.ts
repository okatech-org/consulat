import {
  OrganizationType,
  OrganizationStatus,
  Country,
  User,
  ServiceCategory,
  TimeSlot,
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
