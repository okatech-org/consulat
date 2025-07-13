'use client';

import { api } from '@/trpc/react';
import { calculateProfileCompletion } from '@/lib/utils';
import { useCurrentUser } from '@/contexts/user-context';

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

export function useUserSidebarData() {
  const { user } = useCurrentUser();

  // Get current profile for completion calculation
  const { data: profile, isLoading: profileLoading } = api.profile.getCurrent.useQuery(
    undefined,
    {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    },
  );

  const completion = profile ? calculateProfileCompletion(profile) : 0;

  // tRPC queries with proper caching
  const { data: documentsCount = 0, isLoading: documentsLoading } =
    api.user.getDocumentsCount.useQuery(undefined, {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    });

  const { data: childrenCount = 0, isLoading: childrenLoading } =
    api.user.getChildrenCount.useQuery(undefined, {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    });

  const { data: upcomingAppointments = 0, isLoading: appointmentsLoading } =
    api.user.getUpcomingAppointmentsCount.useQuery(undefined, {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    });

  const { data: activeRequests = 0, isLoading: requestsLoading } =
    api.user.getActiveRequestsCount.useQuery(undefined, {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    });

  const { data: notificationsResult, isLoading: notificationsLoading } =
    api.notifications.getUnreadCount.useQuery(undefined, {
      staleTime: CACHE_DURATION,
      enabled: !!user?.id,
    });

  const loading =
    documentsLoading ||
    childrenLoading ||
    appointmentsLoading ||
    requestsLoading ||
    notificationsLoading ||
    profileLoading;

  const data: NavigationData = {
    profileCompletion: completion,
    activeRequests,
    documentsCount,
    childrenCount,
    notificationsCount: notificationsResult || 0,
    upcomingAppointments,
  };

  // Invalidate cache function
  const invalidateCache = () => {
    // Use tRPC utils to invalidate queries
    const utils = api.useUtils();
    utils.user.invalidate();
    utils.notifications.getUnreadCount.invalidate();
    utils.profile.getCurrent.invalidate();
  };

  return { data, loading, invalidateCache };
}
