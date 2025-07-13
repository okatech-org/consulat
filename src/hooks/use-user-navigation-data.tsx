'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCurrentUser } from '@/contexts/user-context';
import { getUnreadNotificationsCount } from '@/actions/notifications';
import { getUserServiceRequests } from '@/actions/services';
import { getUserFullProfileById } from '@/lib/user/getters';
import { useProfileCompletion } from '@/app/(authenticated)/my-space/profile/_utils/hooks/use-profile-completion';
import { api } from '@/trpc/react';

export interface NavigationData {
  profileCompletion: number;
  activeRequests: number;
  documentsCount: number;
  childrenCount: number;
  notificationsCount: number;
  upcomingAppointments: number;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  data: NavigationData;
  timestamp: number;
}

// In-memory cache
let cache: CachedData | null = null;

export function useUserNavigationData() {
  const { user } = useCurrentUser();
  const [data, setData] = useState<NavigationData>({
    profileCompletion: 0,
    activeRequests: 0,
    documentsCount: 0,
    childrenCount: 0,
    notificationsCount: 0,
    upcomingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const completion = useProfileCompletion(profile);

  // tRPC queries with proper caching
  const { data: documentsCount } = api.user.getDocumentsCount.useQuery(undefined, {
    staleTime: CACHE_DURATION,
    enabled: !!user?.id,
  });

  const { data: childrenCount } = api.user.getChildrenCount.useQuery(undefined, {
    staleTime: CACHE_DURATION,
    enabled: !!user?.id,
  });

  const { data: upcomingAppointments } = api.user.getUpcomingAppointmentsCount.useQuery(
    undefined,
    {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    },
  );

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, []);

  // Fetch navigation data that isn't handled by tRPC
  const fetchNavigationData = useCallback(async () => {
    if (!user?.id) return;

    // Return cached data if valid for non-tRPC data
    if (isCacheValid() && cache) {
      setData((prev) => ({
        ...prev,
        profileCompletion: completion.overall || 0,
        activeRequests: cache!.data.activeRequests,
        notificationsCount: cache!.data.notificationsCount,
        documentsCount: documentsCount || 0,
        childrenCount: childrenCount || 0,
        upcomingAppointments: upcomingAppointments || 0,
      }));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch non-tRPC data
      const [notificationsResult, serviceRequests, userProfile] = await Promise.all([
        getUnreadNotificationsCount(),
        getUserServiceRequests(),
        getUserFullProfileById(user.id),
      ]);

      // Count active requests
      const activeRequestsCount =
        serviceRequests?.filter((req) =>
          [
            'DRAFT',
            'SUBMITTED',
            'EDITED',
            'PENDING',
            'PENDING_COMPLETION',
            'VALIDATED',
            'CARD_IN_PRODUCTION',
          ].includes(req.status),
        )?.length || 0;

      const newData: NavigationData = {
        profileCompletion: completion.overall || 0,
        activeRequests: activeRequestsCount,
        documentsCount: documentsCount || 0,
        childrenCount: childrenCount || 0,
        notificationsCount: notificationsResult?.count || 0,
        upcomingAppointments: upcomingAppointments || 0,
      };

      // Update cache for non-tRPC data
      cache = {
        data: {
          profileCompletion: newData.profileCompletion,
          activeRequests: newData.activeRequests,
          notificationsCount: newData.notificationsCount,
          documentsCount: 0, // tRPC handles this
          childrenCount: 0, // tRPC handles this
          upcomingAppointments: 0, // tRPC handles this
        },
        timestamp: Date.now(),
      };

      setData(newData);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching navigation data:', error);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    completion.overall,
    documentsCount,
    childrenCount,
    upcomingAppointments,
    isCacheValid,
  ]);

  // Invalidate cache function
  const invalidateCache = useCallback(() => {
    cache = null;
    fetchNavigationData();
  }, [fetchNavigationData]);

  // Initial fetch and updates
  useEffect(() => {
    fetchNavigationData();
  }, [fetchNavigationData]);

  // Update when tRPC data changes
  useEffect(() => {
    setData((prev) => ({
      ...prev,
      documentsCount: documentsCount || 0,
      childrenCount: childrenCount || 0,
      upcomingAppointments: upcomingAppointments || 0,
    }));
  }, [documentsCount, childrenCount, upcomingAppointments]);

  // Update profile completion when it changes
  useEffect(() => {
    if (completion.overall > 0) {
      setData((prev) => ({
        ...prev,
        profileCompletion: completion.overall,
      }));
    }
  }, [completion.overall]);

  return { data, loading, invalidateCache };
}
