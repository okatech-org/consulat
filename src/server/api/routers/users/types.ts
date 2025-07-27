import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { userRouter } from './user';

// Types d'input pour toutes les procédures du router users
export type UsersRouterInputs = inferRouterInputs<typeof userRouter>;

// Types d'output pour toutes les procédures du router users
export type UsersRouterOutputs = inferRouterOutputs<typeof userRouter>;

// Type pour la liste des utilisateurs
export type UserListItem = {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  roles: string[];
  role: string;
  country: {
    id: string;
    name: string;
    code: string;
  } | null;
  assignedOrganization: {
    id: string;
    name: string;
  } | null;
  profile: {
    id: string;
    status: string;
    cardNumber: string | null;
  } | null;
  createdAt: Date;
  _count: {
    submittedRequests: number;
    assignedRequests: number;
  };
};

// Type pour les détails d'un utilisateur
export type UserDetails = {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
  emailVerified: Date | null;
  roles: string[];
  role: string;
  createdAt: Date;
  updatedAt: Date;
  country: {
    id: string;
    name: string;
    code: string;
  } | null;
  assignedOrganization: {
    id: string;
    name: string;
    type: string;
    status: string;
  } | null;
  managedOrganization: {
    id: string;
    name: string;
    type: string;
    status: string;
  } | null;
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
    cardNumber: string | null;
    cardIssuedAt: Date | null;
    cardExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  submittedRequests: Array<{
    id: string;
    status: string;
    serviceCategory: string;
    priority: string;
    createdAt: Date;
    service: {
      id: string;
      name: string;
    };
  }>;
  assignedRequests: Array<{
    id: string;
    status: string;
    serviceCategory: string;
    priority: string;
    createdAt: Date;
    service: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    submittedRequests: number;
    assignedRequests: number;
    managedAgents: number;
  };
};

// Filtres pour la liste des utilisateurs
export type UsersFilters = {
  search?: string;
  roles?: string[];
  countryCode?: string[];
  organizationId?: string[];
  hasProfile?: boolean;
};

// Types spécifiques pour getDocumentsCount
export type DocumentsCount = UsersRouterOutputs['getDocumentsCount'];

// Types pour getChildrenCount
export type ChildrenCount = UsersRouterOutputs['getChildrenCount'];

// Types pour getUpcomingAppointmentsCount
export type UpcomingAppointmentsCount =
  UsersRouterOutputs['getUpcomingAppointmentsCount'];

// Types pour getActiveRequestsCount
export type ActiveRequestsCount = UsersRouterOutputs['getActiveRequestsCount'];
