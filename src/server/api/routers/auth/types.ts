import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { authRouter } from './auth';

// Types d'input pour toutes les procédures du router auth
export type AuthRouterInputs = inferRouterInputs<typeof authRouter>;

// Types d'output pour toutes les procédures du router auth
export type AuthRouterOutputs = inferRouterOutputs<typeof authRouter>;

// Types spécifiques pour getActiveCountries
export type GetActiveCountriesResult = AuthRouterOutputs['getActiveCountries'];
