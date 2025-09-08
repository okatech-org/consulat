'use client';

import { useEffect } from 'react';
import { api } from '@/trpc/react';

/**
 * Hook pour précharger les données intelligence en arrière-plan
 * Améliore la navigation en chargeant les données avant qu'elles soient nécessaires
 */
export function usePrefetchIntelData() {
  const utils = api.useUtils();

  useEffect(() => {
    // Précharger les données communes après le montage initial
    const prefetchTimer = setTimeout(() => {
      // Précharger les stats du dashboard
      utils.intelligence.getDashboardStats.prefetch({ period: 'month' });
      utils.intelligence.getDashboardStats.prefetch({ period: 'week' });
      
      // Précharger des profils (avec notes) via getProfiles
      utils.intelligence.getProfiles.prefetch({ page: 1, limit: 20, filters: { hasNotes: true } });
      
      // Précharger les notes intelligence
      utils.intelligence.getIntelligenceNotes.prefetch({ filters: undefined });
      
      // Précharger les pays actifs
      utils.countries.getActive.prefetch({ organizationId: undefined });
      
      // Précharger le nombre de notifications
      utils.notifications.getUnreadCount.prefetch();
    }, 1000); // Attendre 1 seconde après le montage

    return () => clearTimeout(prefetchTimer);
  }, [utils]);
}

/**
 * Hook pour précharger les données d'une page spécifique
 * À utiliser dans les liens de navigation pour précharger avant le clic
 */
export function usePrefetchPage(page: 'profiles' | 'notes' | 'carte' | 'securite' | 'rapports') {
  const utils = api.useUtils();

  const prefetch = () => {
    switch (page) {
      case 'profiles':
        utils.intelligence.getProfiles.prefetch({ page: 1, limit: 20, filters: { hasNotes: true } });
        break;
      case 'notes':
        utils.intelligence.getIntelligenceNotes.prefetch({ filters: undefined });
        break;
      case 'carte':
        utils.intelligence.getProfilesMap.prefetch({ filters: undefined });
        break;
      case 'securite':
        // Précharger les données de sécurité si nécessaire
        utils.intelligence.getDashboardStats.prefetch({ period: 'day' });
        break;
      case 'rapports':
        utils.intelligence.getDashboardStats.prefetch({ period: 'month' });
        break;
    }
  };

  return { prefetch };
}
