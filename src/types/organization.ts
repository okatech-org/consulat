import { OrganizationType, OrganizationStatus, Country, User } from '@prisma/client';
import { ConsularServiceListingItem } from '@/types/consular-service';

export interface Organization {
  id: string;
  name: string;
  logo: string | null;
  type: OrganizationType;
  status: OrganizationStatus;
  countries: Country[];
  metadata: Record<string, unknown> | null;
  services: ConsularServiceListingItem[] | null;
  createdAt: Date;
  updatedAt: Date;
  User: User | null;

  // Relations calculées
  _count?: {
    services: number;
  };
}
