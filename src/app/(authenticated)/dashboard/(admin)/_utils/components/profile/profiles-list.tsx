'use client';

import { FullProfile } from '@/types';
import { ProfileCard } from './profile-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

interface ProfilesListProps {
  profiles: FullProfile[];
}

export function ProfilesList({ profiles }: ProfilesListProps) {
  if (profiles.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={'Pas de profile'}
        description={"Il n'y a pas de profile consulaires enregistrés"}
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
