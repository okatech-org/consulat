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

export const UserSessionInclude = {
  select: {
    id: true,
    profileId: true,
    name: true,
    email: true,
    phoneNumber: true,
    roles: true,
    image: true,
    emailVerified: true,
    phoneVerified: true,
    countryCode: true,
    lastLogin: true,
  },
} as const;

export const AgentSessionInclude = {
  select: {
    ...UserSessionInclude.select,
    specializations: true,
    linkedCountries: true,
    assignedOrganizationId: true,
    maxActiveRequests: true,
    completedRequests: true,
    averageProcessingTime: true,
  },
} as const;

export const AdminSessionInclude = {
  select: {
    ...UserSessionInclude.select,
    organizationId: true,
  },
} as const;

export const AllSessionInclude = {
  select: {
    ...UserSessionInclude.select,
    ...AgentSessionInclude.select,
    ...AdminSessionInclude.select,
  },
} as const;

export type SessionUser = Prisma.UserGetPayload<typeof AllSessionInclude>;
export type UserSession = Prisma.UserGetPayload<typeof UserSessionInclude>;
export type AgentSession = Prisma.UserGetPayload<typeof AgentSessionInclude>;
export type AdminSession = Prisma.UserGetPayload<typeof AdminSessionInclude>;
export type SuperAdminSession = Prisma.UserGetPayload<typeof UserSessionInclude>;
