'use client';

import { useCurrentProfile } from '@/hooks/use-profile';
import { useUserServiceRequests } from '@/hooks/use-services';
import { useChildProfiles } from '@/hooks/use-child-profiles';
import { useUnreadCount } from '@/hooks/use-notifications';
import { calculateProfileCompletion } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useMemo } from 'react';

export function useUserSidebarData() {
  const { data: profile } = useCurrentProfile();
  const { requests } = useUserServiceRequests();
  const { totalChildren } = useChildProfiles();
  const { count: notificationsCount } = useUnreadCount();

  // Récupération du nombre de documents
  const { data: documents } = api.documents.getUserDocuments.useQuery();

  // Calculs memoized pour les performances
  const profileCompletion = useMemo(() => {
    return profile ? calculateProfileCompletion(profile) : 0;
  }, [profile]);

  const requestsCount = useMemo(() => {
    return (
      requests?.filter((r) => ['PENDING', 'SUBMITTED', 'PROCESSING'].includes(r.status))
        .length || 0
    );
  }, [requests]);

  const documentsCount = useMemo(() => {
    return documents?.length || 0;
  }, [documents]);

  return {
    profileCompletion,
    requestsCount,
    documentsCount,
    childrenCount: totalChildren,
    notificationsCount,
  };
}
