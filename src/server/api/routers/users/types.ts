import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { userRouter } from './user';

// Types d'input pour toutes les procédures du router users
export type UsersRouterInputs = inferRouterInputs<typeof userRouter>;

// Types d'output pour toutes les procédures du router users
export type UsersRouterOutputs = inferRouterOutputs<typeof userRouter>;

// Types spécifiques pour getDocumentsCount
export type DocumentsCount = UsersRouterOutputs['getDocumentsCount'];

// Types pour getChildrenCount
export type ChildrenCount = UsersRouterOutputs['getChildrenCount'];

// Types pour getUpcomingAppointmentsCount
export type UpcomingAppointmentsCount =
  UsersRouterOutputs['getUpcomingAppointmentsCount'];

// Types pour getActiveRequestsCount
export type ActiveRequestsCount = UsersRouterOutputs['getActiveRequestsCount'];
