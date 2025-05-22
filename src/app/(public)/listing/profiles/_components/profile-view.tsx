'use client';

import { FullProfile } from '@/types/profile';
import { ProfileHeader } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-header';
import { ProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-tabs';
import { ServiceRequest } from '@prisma/client';

interface ProfileViewProps {
  profile: FullProfile;
  hasFullAccess?: boolean;
  requests?: ServiceRequest[];
}

export function ProfileView({
  profile,
  hasFullAccess = false,
  requests,
}: ProfileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ProfileHeader profile={profile} />
      {hasFullAccess && <ProfileTabs profile={profile} requests={requests} />}
    </div>
  );
}
