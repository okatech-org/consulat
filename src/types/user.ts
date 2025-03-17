import { Prisma } from '@prisma/client';

export const SessionUserInclude = {
  select: {
    id: true,
    profileId: true,
    organizationId: true,
    assignedOrganizationId: true,
    name: true,
    email: true,
    phoneNumber: true,
    roles: true,
    image: true,
    emailVerified: true,
    countryCode: true,
    specializations: true,
    linkedCountries: true,
  },
} as const;

export type SessionUser = Prisma.UserGetPayload<typeof SessionUserInclude>;
