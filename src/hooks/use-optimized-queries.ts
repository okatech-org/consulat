'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from './use-current-user';

/**
 * Hook pour les stats du dashboard intelligence
 * MIGRATED TO CONVEX - Direct usage
 */
export function useIntelligenceDashboardStats(
  period: 'day' | 'week' | 'month' | 'year' = 'month',
) {
  return useQuery(api.functions.intelligence.getDashboardStats, { period });
}

/**
 * Hook pour les notifications
 */
export function useNotificationCount() {
  const { user } = useCurrentUser();

  return useQuery(
    api.functions.notification.getUnreadNotificationsCount,
    user?._id ? { userId: user._id } : 'skip',
  );
}

/**
 * Hook pour la carte des profils intelligence
 * MIGRATED TO CONVEX - Direct usage
 */
export function useIntelligenceProfilesMap(filters?: any) {
  return useQuery(
    api.functions.intelligence.getProfilesMap,
    filters ? { filters } : 'skip',
  );
}

/**
 * Hook pour les profils avec notes intelligence
 * MIGRATED TO CONVEX - Direct usage
 */
export function useIntelligenceProfilesWithNotes(filters?: any) {
  return useQuery(api.functions.intelligence.getProfiles, {
    page: 1,
    limit: 20,
    filters: { ...(filters || {}), hasNotes: true },
  });
}

/**
 * Hook pour les notes intelligence
 * MIGRATED TO CONVEX - Direct usage
 */
export function useIntelligenceNotes(filters?: any) {
  return useQuery(
    api.functions.intelligence.getIntelligenceNotes,
    filters ? { filters } : 'skip',
  );
}
