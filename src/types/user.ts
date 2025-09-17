import { Prisma } from '@prisma/client';

export const UserSessionInclude: Prisma.UserSelect = {
  id: true,
  profileId: true,
  name: true,
  email: true,
  phoneNumber: true,
  roles: true,
  image: true,
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

export const IntelAgentSessionInclude: Prisma.UserSelect = {
  ...UserSessionInclude,
} as const;

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
export type IntelAgentSession = Prisma.UserGetPayload<{
  select: typeof IntelAgentSessionInclude;
}>;
export type UserSession = Prisma.UserGetPayload<{
  select: typeof UserSessionInclude;
}>;

export type SessionUser =
  | AgentSession
  | AdminSession
  | ManagerSession
  | SuperAdminSession
  | IntelAgentSession
  | UserSession;
