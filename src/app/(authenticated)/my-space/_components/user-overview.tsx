'use client';

import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import type { DashboardProfile } from '@/types/profile';
import { useDateLocale } from '@/lib/utils';

interface UserOverviewProps {
  stats: {
    inProgress: number;
    completed: number;
    pending: number;
    appointments: number;
  };
  profile: DashboardProfile | null;
  documentsCount: number;
  childrenCount: number;
}

export function UserOverview({
  stats,
  profile,
  documentsCount,
  childrenCount,
}: UserOverviewProps) {
  const { formatDate } = useDateLocale();
  const t = useTranslations('dashboard.unified.user_overview');

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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(profile?.firstName, profile?.lastName)}
          </div>
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
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.in_progress')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.completed')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{documentsCount}</div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.documents')}
            </div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">{childrenCount}</div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('stats.children')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
