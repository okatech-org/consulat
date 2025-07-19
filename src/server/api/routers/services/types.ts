import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { servicesRouter } from './services';

// Types d'input pour toutes les procédures du router services
export type ServicesRouterInputs = inferRouterInputs<typeof servicesRouter>;

// Types d'output pour toutes les procédures du router services
export type ServicesRouterOutputs = inferRouterOutputs<typeof servicesRouter>;

// Types spécifiques pour getAvailableServicesDashboard
export type GetAvailableServicesDashboardInput =
  ServicesRouterInputs['getAvailableServicesDashboard'];
export type AvailableServicesDashboard =
  ServicesRouterOutputs['getAvailableServicesDashboard'];

// Types pour getUserServiceRequestsDashboard
export type GetUserServiceRequestsDashboardInput =
  ServicesRouterInputs['getUserServiceRequestsDashboard'];
export type UserServiceRequestsDashboard =
  ServicesRouterOutputs['getUserServiceRequestsDashboard'];

// Types pour getAvailable
export type AvailableServices = ServicesRouterOutputs['getAvailable'];

// Types pour getUserRequests
export type UserServiceRequests = ServicesRouterOutputs['getUserRequests'];

// Types pour getRequestById
export type GetServiceRequestByIdInput = ServicesRouterInputs['getRequestById'];
export type ServiceRequestDetails = ServicesRouterOutputs['getRequestById'];

// Types pour getServiceDetails
export type GetServiceDetailsInput = ServicesRouterInputs['getServiceDetails'];
export type ServiceDetails = ServicesRouterOutputs['getServiceDetails'];

// Types pour getService
export type GetServiceInput = ServicesRouterInputs['getService'];
export type ServiceById = ServicesRouterOutputs['getService'];

// Types pour submitRequest
export type SubmitServiceRequestInput = ServicesRouterInputs['submitRequest'];
export type SubmitServiceRequestResult = ServicesRouterOutputs['submitRequest'];
