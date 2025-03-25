import { OrganizationListingItem } from '@/types/organization';

export const getOrganizationFromId = (
  organisations: OrganizationListingItem[],
  organizationId: string | null,
) => {
  if (!organizationId) return undefined;
  return organisations.find((o) => o.id === organizationId);
};
