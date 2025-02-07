'use client';

import { FullProfile } from '@/types';
import { ProfileCard } from './profile-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProfilesListProps {
  profiles: FullProfile[];
}

export function ProfilesList({ profiles }: ProfilesListProps) {
  const t = useTranslations('admin.profile');

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t('empty.title')}
        description={t('empty.description')}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          onClick={() => {
            console.log('profile', profile);
          }}
        />
      ))}
    </div>
  );
}
