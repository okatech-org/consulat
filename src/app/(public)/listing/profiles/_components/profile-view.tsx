'use client';

import { ProfileHeader } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-header';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';
import type { CompleteProfile } from '@/convex/lib/types';

interface ProfileViewProps {
  profile: CompleteProfile;
  hasFullAccess?: boolean;
  showRequests?: boolean;
}

export function ProfileView({
  profile,
  hasFullAccess = false,
  showRequests = false,
}: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProfileHeader profile={profile} />
      {hasFullAccess && <ProfileTabs profile={profile} showRequests={showRequests} />}
    </div>
  );
}
