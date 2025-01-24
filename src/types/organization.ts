import { OrganizationType, OrganizationStatus, Country, User } from '@prisma/client';
import { ConsularServiceListingItem } from '@/types/consular-service';

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  type: OrganizationType;
  status: OrganizationStatus;
  countries: Country[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
  services?: ConsularServiceListingItem[];
  createdAt: Date;
  updatedAt: Date;
  User: User | null;

  // Relations calculées
  _count?: {
    services: number;
  };
}
