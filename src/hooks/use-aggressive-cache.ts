'use client';

import { useEffect } from 'react';
import { api } from '@/trpc/react';

// Configuration de cache agressive pour React Query
export const aggressiveCacheConfig = {
  staleTime: 10 * 60 * 1000, // 10 minutes - les données restent fraîches
  gcTime: 30 * 60 * 1000, // 30 minutes - garde en cache
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: 1,
  retryDelay: 1000,
};

// Configuration pour les données qui changent rarement
export const staticDataCacheConfig = {
  staleTime: 60 * 60 * 1000, // 1 heure
  gcTime: 2 * 60 * 60 * 1000, // 2 heures
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: 0,
};

// Hook pour précharger TOUTES les routes au démarrage
export function useAggressivePrefetch() {
  const utils = api.useUtils();

  useEffect(() => {
    // Précharger toutes les données importantes dès le démarrage
    const prefetchAll = async () => {
      const promises = [];

      // Données statiques (changent rarement)
      promises.push(
        utils.countries.getActive.prefetch(undefined, staticDataCacheConfig)
      );

      // Données du dashboard
      promises.push(
        utils.intelligence.getDashboardStats.prefetch(
          { period: 'month' },
          aggressiveCacheConfig
        ),
        utils.intelligence.getDashboardStats.prefetch(
          { period: 'week' },
          aggressiveCacheConfig
        ),
        utils.intelligence.getDashboardStats.prefetch(
          { period: 'day' },
          aggressiveCacheConfig
        )
      );

      // Profils - plusieurs pages
      for (let page = 1; page <= 3; page++) {
        promises.push(
          utils.profile.getList.prefetch(
            {
              page,
              limit: 15,
              sort: { field: 'createdAt', order: 'desc' },
              filters: {}
            },
            aggressiveCacheConfig
          )
        );
      }

      // Carte
      promises.push(
        utils.intelligence.getProfilesMap.prefetch(
          { filters: undefined },
          aggressiveCacheConfig
        )
      );

      // Compétences
      promises.push(
        utils.skillsDirectory.getDirectory.prefetch(
          {},
          aggressiveCacheConfig
        )
      );

      // Notes
      promises.push(
        utils.intelligence.getIntelligenceNotes.prefetch(
          { filters: undefined },
          aggressiveCacheConfig
        )
      );

      // Entités surveillées
      promises.push(
        utils.intelligence.getProfiles.prefetch(
          { filters: {} },
          aggressiveCacheConfig
        )
      );

      // Notifications
      promises.push(
        utils.notifications.getUnreadCount.prefetch(
          undefined,
          aggressiveCacheConfig
        )
      );

      // Exécuter toutes les requêtes en parallèle
      await Promise.allSettled(promises);
    };

    // Démarrer le préchargement après un court délai
    const timeout = setTimeout(prefetchAll, 100);

    return () => clearTimeout(timeout);
  }, [utils]);
}

// Hook pour maintenir les données fraîches en arrière-plan
export function useBackgroundRefresh() {
  const utils = api.useUtils();

  useEffect(() => {
    // Rafraîchir les données critiques toutes les 2 minutes
    const interval = setInterval(() => {
      // Rafraîchir seulement les données importantes
      utils.intelligence.getDashboardStats.invalidate({ period: 'day' });
      utils.notifications.getUnreadCount.invalidate();
      
      // Rafraîchir la première page des profils
      utils.profile.getList.invalidate({
        page: 1,
        limit: 15,
        sort: { field: 'createdAt', order: 'desc' },
        filters: {}
      });
    }, 2 * 60 * 1000); // 2 minutes

    return () => clearInterval(interval);
  }, [utils]);
}
