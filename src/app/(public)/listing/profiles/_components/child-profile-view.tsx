'use client';

import { ChildProfileHeader } from '@/app/(authenticated)/my-space/profile/_utils/components/child-profile-header';
import { ChildProfileTabs } from '@/app/(authenticated)/my-space/profile/_utils/components/child-profile-tabs';
import type { CompleteChildProfile } from '@/convex/lib/types';

interface ChildProfileViewProps {
  profile: CompleteChildProfile;
  hasFullAccess?: boolean;
  showRequests?: boolean;
}

export function ChildProfileView({
  profile,
  hasFullAccess = false,
  showRequests = false,
}: ChildProfileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ChildProfileHeader profile={profile} />
      {hasFullAccess && <ChildProfileTabs profile={profile} showRequests={showRequests} />}
    </div>
  );
}
