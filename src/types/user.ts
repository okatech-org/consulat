import { Prisma } from '@prisma/client';

export const SessionUserInclude = {
  select: {
    id: true,
    profileId: true,
    organizationId: true,
    assignedOrganizationId: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: {
      select: {
        number: true,
        countryCode: true,
      },
    },
    roles: true,
    image: true,
    emailVerified: true,
    countryCode: true,
    specializations: true,
    linkedCountries: true,
  },
} as const;

export type SessionUser = Prisma.UserGetPayload<typeof SessionUserInclude>;
