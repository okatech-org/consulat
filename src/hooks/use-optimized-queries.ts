'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  useIntelligenceDashboardStats as useConvexIntelligenceDashboardStats,
  useIntelligenceProfilesMap as useConvexIntelligenceProfilesMap,
  useIntelligenceNotes as useConvexIntelligenceNotes,
  useIntelligenceProfiles as useConvexIntelligenceProfiles,
} from './use-intelligence';
import { useCurrentUser } from './use-current-user';

/**
 * Hook pour les stats du dashboard intelligence
 * MIGRATED TO CONVEX
 */
export function useIntelligenceDashboardStats(
  period: 'day' | 'week' | 'month' | 'year' = 'month',
) {
  return useConvexIntelligenceDashboardStats(period);
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
 * MIGRATED TO CONVEX
 */
export function useIntelligenceProfilesMap(filters?: any) {
  return useConvexIntelligenceProfilesMap(filters);
}

/**
 * Hook pour les profils avec notes intelligence
 * MIGRATED TO CONVEX
 */
export function useIntelligenceProfilesWithNotes(filters?: any) {
  return useConvexIntelligenceProfiles(1, 20, { ...(filters || {}), hasNotes: true });
}

/**
 * Hook pour les notes intelligence
 * MIGRATED TO CONVEX
 */
export function useIntelligenceNotes(filters?: any) {
  return useConvexIntelligenceNotes(filters);
}
