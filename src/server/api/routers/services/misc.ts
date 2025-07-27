import { Prisma } from '@prisma/client';

export const ServiceListItemSelect: Prisma.ConsularServiceSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  isActive: true,
  organization: {
    select: {
      id: true,
      name: true,
      type: true,
      countries: true,
    },
  },
};

export type ServiceListItem = Prisma.ConsularServiceGetPayload<{
  select: typeof ServiceListItemSelect;
}>;
