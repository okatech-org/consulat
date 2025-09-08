import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import SuperJSON from 'superjson';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes par défaut
        gcTime: 10 * 60 * 1000, // 10 minutes en mémoire
        refetchOnWindowFocus: false, // Éviter les refetch inutiles
        refetchOnReconnect: true, // Refetch seulement à la reconnexion
        retry: 3, // 3 tentatives maximum
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1, // 1 seule tentative pour les mutations
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
