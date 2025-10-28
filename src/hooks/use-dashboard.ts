'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from './use-current-user';
import { UserRole } from '@/convex/lib/constants';

export function useDashboard<T = any>() {
  const { user } = useCurrentUser();

  // Admin dashboard data
  const adminStats = useQuery(
    api.functions.analytics.getDashboardStats,
    user?.roles?.includes(UserRole.Admin) ? {} : 'skip',
  );

  // Manager dashboard data
  const managerStats = useQuery(
    api.functions.analytics.getManagerDashboardData,
    user?._id && user?.roles?.includes(UserRole.Manager) ? { userId: user._id } : 'skip',
  );

  // Agent dashboard data - using requests and appointments
  const agentRequests = useQuery(
    api.functions.request.getUserRequests,
    user?.profileId ? { profileId: user.profileId } : 'skip',
  );

  const agentAppointments = useQuery(
    api.functions.appointment.getAppointmentsByUser,
    user?._id ? { userId: user._id } : 'skip',
  );

  // Determine which data to return based on user role
  if (user?.roles?.includes(UserRole.Admin)) {
    return {
      data: adminStats as T,
      isLoading: adminStats === undefined,
    };
  }

  if (user?.roles?.includes(UserRole.Manager)) {
    return {
      data: managerStats as T,
      isLoading: managerStats === undefined,
    };
  }

  // Agent dashboard - construct data from requests and appointments
  if (user?.roles?.includes(UserRole.Agent)) {
    const agentData = {
      stats: {
        upcomingAppointments:
          agentAppointments?.filter(
            (apt) => apt.status === 'confirmed' && apt.startAt > Date.now(),
          ).length || 0,
        completedRequests:
          agentRequests?.filter((req) => req.status === 'completed').length || 0,
        pendingRequests:
          agentRequests?.filter((req) =>
            ['submitted', 'pending', 'pending_completion'].includes(req.status),
          ).length || 0,
        processingRequests:
          agentRequests?.filter((req) =>
            [
              'validated',
              'card_in_production',
              'ready_for_pickup',
              'appointment_scheduled',
            ].includes(req.status),
          ).length || 0,
      },
      recentRequests: agentRequests?.slice(0, 5) || [],
      appointments: {
        upcoming:
          agentAppointments
            ?.filter((apt) => apt.status === 'confirmed' && apt.startAt > Date.now())
            .slice(0, 5) || [],
      },
    };

    return {
      data: agentData as T,
      isLoading: agentRequests === undefined || agentAppointments === undefined,
    };
  }

  return {
    data: null,
    isLoading: false,
  };
}
