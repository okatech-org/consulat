import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import SuperJSON from 'superjson';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes - augmenté pour moins de refetch
        gcTime: 30 * 60 * 1000, // 30 minutes - garde en cache plus longtemps
        refetchOnWindowFocus: false, // Désactivé pour éviter les refetch inutiles
        refetchOnReconnect: false, // Désactivé pour navigation plus rapide
        refetchOnMount: false, // Utilise le cache si disponible
        retry: 1, // Réduit pour échouer plus vite
        retryDelay: 500, // Délai fixe court
        networkMode: 'offlineFirst', // Priorise le cache
      },
      mutations: {
        retry: 1,
        retryDelay: 500,
        networkMode: 'offlineFirst',
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
