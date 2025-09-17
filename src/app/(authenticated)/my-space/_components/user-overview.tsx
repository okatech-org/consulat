'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/trpc/react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { RequestListItem } from '@/server/api/routers/requests/misc';
import { useCurrentUser } from '@/hooks/use-role-data';

interface Stats {
  inProgress: number;
  completed: number;
  pending: number;
}

function calculateRequestStats(requests: RequestListItem[]): Stats {
  if (!requests) return { inProgress: 0, completed: 0, pending: 0 };

  return {
    inProgress: requests.filter((req) =>
      ['SUBMITTED', 'VALIDATED', 'PROCESSING'].includes(req.status),
    ).length,
    completed: requests.filter((req) => req.status === 'COMPLETED').length,
    pending: requests.filter((req) => req.status === 'DRAFT').length,
  };
}

export function UserOverview() {
  const { user } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = api.profile.getCurrent.useQuery({
    profileId: user.profileId,
  });
  const { data: requestsData, isLoading: requestsLoading } =
    api.requests.getList.useQuery({});
  const { data: documents, isLoading: documentsLoading } =
    api.documents.getUserDocuments.useQuery();

  const requests = requestsData?.items || [];
  const isLoading = profileLoading || requestsLoading || documentsLoading;
  const { formatDate } = useDateLocale();
  const t = useTranslations('dashboard.unified.user_overview');
  const requestStats = calculateRequestStats(requests);

  if (isLoading) {
    return <LoadingSkeleton variant="card" className="!w-full h-48" />;
  }

  // Générer les initiales à partir du profil
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  // Formatage du nom complet
  const getDisplayName = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return t('anonymous_user');
    return `${firstName || ''} ${lastName || ''}`.trim() || t('anonymous_user');
  };

  // Formatage de la date de création du profil
  const getMemberSince = () => {
    if (!profile) return t('member_since_unknown');
    try {
      const createdDate = new Date();
      return t('member_since') + ' ' + formatDate(createdDate, 'MMMM yyyy');
    } catch {
      return t('member_since_unknown');
    }
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Informations utilisateur */}
        <div className="flex items-center gap-4">
          <Avatar className="size-12 bg-muted md:size-20">
            {profile?.identityPicture ? (
              <AvatarImage
                src={profile?.identityPicture.fileUrl}
                alt={profile?.firstName || ''}
              />
            ) : (
              <AvatarFallback>
                {getInitials(profile?.firstName, profile?.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">
              {getDisplayName(profile?.firstName, profile?.lastName)}
            </h3>
            {profile?.status && (
              <p className="text-sm text-muted-foreground">
                {t('status')} : {t(`profile_status.${profile.status.toLowerCase()}`)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{getMemberSince()}</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {requestStats.inProgress}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.in_progress')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {requestStats.completed}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.completed')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {documents?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.documents')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">
              {profile?.parentAuthorities?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.children')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
