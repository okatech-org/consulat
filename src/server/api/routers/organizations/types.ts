import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { organizationsRouter } from './organizations';

// Types d'input pour toutes les procédures du router organizations
export type OrganizationsRouterInputs = inferRouterInputs<typeof organizationsRouter>;

// Types d'output pour toutes les procédures du router organizations
export type OrganizationsRouterOutputs = inferRouterOutputs<typeof organizationsRouter>;

// Types spécifiques pour getByIdWithSelect
export type GetByIdWithSelectInput = OrganizationsRouterInputs['getByIdWithSelect'];
export type OrganizationWithSelect = OrganizationsRouterOutputs['getByIdWithSelect'];

// Types pour getList
export type OrganizationListQueryInput = OrganizationsRouterInputs['getList'];
export type OrganizationListQueryResult = OrganizationsRouterOutputs['getList'];
export type OrganizationListItem = OrganizationListQueryResult['items'][number];

// Types pour getById
export type GetOrganizationByIdInput = OrganizationsRouterInputs['getById'];
export type OrganizationDetails = OrganizationsRouterOutputs['getById'];

// Types pour create
export type CreateOrganizationInput = OrganizationsRouterInputs['create'];
export type CreateOrganizationResult = OrganizationsRouterOutputs['create'];

// Types pour update
export type UpdateOrganizationInput = OrganizationsRouterInputs['update'];
export type UpdateOrganizationResult = OrganizationsRouterOutputs['update'];

// Types pour updateStatus
export type UpdateOrganizationStatusInput = OrganizationsRouterInputs['updateStatus'];
export type UpdateOrganizationStatusResult = OrganizationsRouterOutputs['updateStatus'];

// Types pour updateSettings
export type UpdateOrganizationSettingsInput = OrganizationsRouterInputs['updateSettings'];
export type UpdateOrganizationSettingsResult =
  OrganizationsRouterOutputs['updateSettings'];

// Types pour delete
export type DeleteOrganizationInput = OrganizationsRouterInputs['delete'];
export type DeleteOrganizationResult = OrganizationsRouterOutputs['delete'];

// Types pour getStats
export type OrganizationsStats = OrganizationsRouterOutputs['getStats'];

// Types pour getByCountry
export type GetByCountryInput = OrganizationsRouterInputs['getByCountry'];
export type OrganizationByCountry = OrganizationsRouterOutputs['getByCountry'];

// Types pour getCountryInfos
export type GetCountryInfosInput = OrganizationsRouterInputs['getCountryInfos'];
export type CountryInfos = OrganizationsRouterOutputs['getCountryInfos'];
