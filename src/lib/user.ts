import { Prisma } from '@prisma/client';

export const UserSessionSelect: Prisma.UserSelect = {
  id: true,
  profileId: true,
  name: true,
  email: true,
  phoneNumber: true,
  roles: true,
  role: true,
  image: true,
  countryCode: true,
} as const;

export const AgentSessionInclude: Prisma.UserSelect = {
  ...UserSessionSelect,
  specializations: true,
  linkedCountries: true,
  assignedOrganizationId: true,
  maxActiveRequests: true,
  completedRequests: true,
  averageProcessingTime: true,
} as const;

export const AdminSessionInclude: Prisma.UserSelect = {
  ...UserSessionSelect,
  organizationId: true,
} as const;

export const ManagerSessionSelect: Prisma.UserSelect = {
  ...UserSessionSelect,
  assignedOrganizationId: true,
  managedAgents: true,
};

export const AllSessionInclude: Prisma.UserSelect = {
  ...UserSessionSelect,
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
  select: typeof UserSessionSelect;
}>;

export type SessionUser = Prisma.UserGetPayload<{
  select: typeof UserSessionSelect;
}>;
