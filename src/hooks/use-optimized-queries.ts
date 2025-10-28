'use client';

import { api } from '@/trpc/react';
import {
  useIntelligenceDashboardStats as useConvexIntelligenceDashboardStats,
  useIntelligenceProfilesMap as useConvexIntelligenceProfilesMap,
  useIntelligenceNotes as useConvexIntelligenceNotes,
  useIntelligenceProfiles as useConvexIntelligenceProfiles,
} from './use-intelligence';

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
 * MIGRATED TO CONVEX
 */
export function useIntelligenceDashboardStats(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return useConvexIntelligenceDashboardStats(period);
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
 * MIGRATED TO CONVEX
 */
export function useIntelligenceProfilesMap(filters?: any) {
  return useConvexIntelligenceProfilesMap(filters);
}

/**
 * Hook optimisé pour les profils avec notes intelligence
 * Cache modéré car les données changent régulièrement
 * MIGRATED TO CONVEX
 */
export function useIntelligenceProfilesWithNotes(filters?: any) {
  return useConvexIntelligenceProfiles(1, 20, { ...(filters || {}), hasNotes: true });
}

/**
 * Hook optimisé pour les notes intelligence
 * Cache court car les notes sont mises à jour fréquemment
 * MIGRATED TO CONVEX
 */
export function useIntelligenceNotes(filters?: any) {
  return useConvexIntelligenceNotes(filters);
}
