import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { countriesRouter } from './countries';

// Types d'input pour toutes les procédures du router countries
export type CountriesRouterInputs = inferRouterInputs<typeof countriesRouter>;

// Types d'output pour toutes les procédures du router countries
export type CountriesRouterOutputs = inferRouterOutputs<typeof countriesRouter>;

// Types spécifiques pour getList
export type CountryListQueryInput = CountriesRouterInputs['getList'];
export type CountryListQueryResult = CountriesRouterOutputs['getList'];
export type CountryListItem = CountryListQueryResult['items'][number];

// Types pour les autres procédures si nécessaire
export type GetByIdInput = CountriesRouterInputs['getById'];
export type CountryDetails = CountriesRouterOutputs['getById'];

export type UpdateCountryInput = CountriesRouterInputs['update'];
export type UpdateCountryResult = CountriesRouterOutputs['update'];

export type DeleteCountryInput = CountriesRouterInputs['delete'];
export type DeleteCountryResult = CountriesRouterOutputs['delete'];

export type CountrieStats = CountriesRouterOutputs['getStats'];

export type CountryActiveQueryInput = CountriesRouterInputs['getActive'];
export type ActiveCountryItem = CountriesRouterOutputs['getActive'][number];
