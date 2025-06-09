import { Prisma } from '@prisma/client';

export const UserSessionInclude: Prisma.UserSelect = {
  id: true,
  profileId: true,
  name: true,
  email: true,
  phoneNumber: true,
  roles: true,
  image: true,
  emailVerified: true,
  phoneNumberVerified: true,
  countryCode: true,
} as const;

export const AgentSessionInclude: Prisma.UserSelect = {
  ...UserSessionInclude,
  specializations: true,
  linkedCountries: true,
  assignedOrganizationId: true,
  maxActiveRequests: true,
  completedRequests: true,
  averageProcessingTime: true,
} as const;

export const AdminSessionInclude: Prisma.UserSelect = {
  ...UserSessionInclude,
  organizationId: true,
} as const;

export const ManagerSessionSelect: Prisma.UserSelect = {
  ...UserSessionInclude,
  assignedOrganizationId: true,
  managedAgents: true,
};

export const AllSessionInclude: Prisma.UserSelect = {
  ...UserSessionInclude,
  ...AgentSessionInclude,
  ...AdminSessionInclude,
  ...ManagerSessionSelect,
} as const;

export type AgentSession = Prisma.UserGetPayload<{
  select: typeof AgentSessionInclude;
}>;
export type AdminSession = Prisma.UserGetPayload<{
  select: typeof AdminSessionInclude;
}>;
export type ManagerSession = Prisma.UserGetPayload<{
  select: typeof ManagerSessionSelect;
}>;
export type SuperAdminSession = Prisma.UserGetPayload<{
  select: typeof UserSessionInclude;
}>;

export type SessionUser =
  | AgentSession
  | AdminSession
  | ManagerSession
  | SuperAdminSession;
