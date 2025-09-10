'use client';

import { api } from '@/trpc/react';

/**
 * Hook optimisé pour les pays actifs avec cache longue durée
 * Les données de pays changent rarement, cache de 24h
 */
export function useActiveCountries(organizationId?: string) {
  return api.countries.getActive.useQuery(
    { organizationId },
    {
      staleTime: 24 * 60 * 60 * 1000, // 24 heures
      gcTime: 24 * 60 * 60 * 1000, // 24 heures en mémoire
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
}

/**
 * Hook optimisé pour les stats du dashboard intelligence 
 * Cache de 5 minutes pour équilibrer fraîcheur et performance
 */
export function useIntelligenceDashboardStats(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return api.intelligence.getDashboardStats.useQuery(
    { period },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes en mémoire
      refetchOnWindowFocus: false,
      refetchInterval: 5 * 60 * 1000, // Actualiser toutes les 5 minutes en arrière-plan
    }
  );
}

/**
 * Hook pour les notifications avec cache court
 * Les notifications doivent être relativement fraîches
 */
export function useNotificationCount() {
  return api.notifications.getUnreadCount.useQuery(
    undefined,
    {
      staleTime: 30 * 1000, // 30 secondes
      gcTime: 2 * 60 * 1000, // 2 minutes en mémoire
      refetchOnWindowFocus: true,
      refetchInterval: 60 * 1000, // Actualiser chaque minute
    }
  );
}

/**
 * Hook optimisé pour la carte des profils intelligence
 * Cache agressif car les données géographiques changent peu
 */
export function useIntelligenceProfilesMap(filters?: any) {
  return api.intelligence.getProfilesMap.useQuery(
    { filters },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes en mémoire
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Éviter les requêtes redondantes pendant Fast Refresh
      refetchOnMount: false,
    }
  );
}

/**
 * Hook optimisé pour les profils avec notes intelligence
 * Cache modéré car les données changent régulièrement
 */
export function useIntelligenceProfilesWithNotes(filters?: any) {
  // Remplacement: la procédure getProfilesWithNotes n'existe pas côté routeur.
  // Utiliser getProfiles avec une pagination minimale et un filtre hasNotes.
  return api.intelligence.getProfiles.useQuery(
    { page: 1, limit: 20, filters: { ...(filters || {}), hasNotes: true } },
    {
      staleTime: 3 * 60 * 1000, // 3 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes en mémoire
      refetchOnWindowFocus: false,
      // éviter les requêtes supplémentaires au montage en dev (Fast Refresh)
      refetchOnMount: false,
    }
  );
}

/**
 * Hook optimisé pour les notes intelligence
 * Cache court car les notes sont mises à jour fréquemment
 */
export function useIntelligenceNotes(filters?: any) {
  return api.intelligence.getIntelligenceNotes.useQuery(
    { filters },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes en mémoire
      refetchOnWindowFocus: false,
      refetchInterval: 3 * 60 * 1000, // Actualiser toutes les 3 minutes
    }
  );
}
