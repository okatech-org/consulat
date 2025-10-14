'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useDateLocale } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';

export function UserOverview() {
  const { user } = useCurrentUser();

  const overviewDatas = useQuery(
    api.functions.profile.getOverviewProfile,
    user?._id && user.profileId
      ? { userId: user._id, profileId: user.profileId }
      : 'skip',
  );

  const { formatDate } = useDateLocale();
  const t = useTranslations('dashboard.unified.user_overview');

  if (overviewDatas === undefined) {
    return <LoadingSkeleton variant="card" className="!w-full h-48" />;
  }

  if (overviewDatas === null) {
    return (
      <Card className="p-6">
        <CardHeader> Nous n&apos;avons pas trouvé de données pour vous. </CardHeader>
      </Card>
    );
  }

  // Générer les initiales à partir du profil
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getMemberSince = () => {
    if (!overviewDatas?.profile?._creationTime) return t('member_since_unknown');
    try {
      const createdDate = new Date(overviewDatas.profile._creationTime);
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
            <AvatarImage src={overviewDatas.profile?.identityPicture} />
            <AvatarFallback>
              {getInitials(
                overviewDatas.profile?.personal?.firstName,
                overviewDatas.profile?.personal?.lastName,
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">
              {overviewDatas.profile?.personal?.firstName}
            </h3>
            {overviewDatas.profile?.status && (
              <p className="text-sm text-muted-foreground">
                {t('status')} : {t(`profile_status.${overviewDatas.profile.status}`)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{getMemberSince()}</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {overviewDatas.requestStats?.pending || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.in_progress')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {overviewDatas.requestStats?.completed || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.completed')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {overviewDatas.documentsCount || 0}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.documents')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">
              {overviewDatas.childrenCount || 0}
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
