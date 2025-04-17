'use client';

import { FullProfile } from '@/types/profile';
import { ProfileHeader } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-header';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';

interface ProfileViewProps {
  profile: FullProfile;
  hasFullAccess?: boolean;
}

export function ProfileView({ profile, hasFullAccess = false }: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProfileHeader profile={profile} />
      {hasFullAccess && <ProfileTabs profile={profile} editMode={false} />}
    </div>
  );
}
