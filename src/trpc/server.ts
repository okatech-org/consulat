import 'server-only';

import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { headers } from 'next/headers';
import { cache } from 'react';

import { createCaller, type AppRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { createQueryClient } from './query-client';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async (headersData: Headers) => {
  const heads = new Headers(headersData);
  heads.set('x-trpc-source', 'rsc');

  return createTRPCContext({
    headers: heads,
  });
});

/**
 * Helper function to get context with headers for tRPC calls
 */
const getContext = async () => {
  const headersList = await headers();
  return createContext(headersList);
};

const getQueryClient = cache(createQueryClient);
const caller = createCaller(getContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
