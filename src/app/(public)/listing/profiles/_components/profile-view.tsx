'use client';

import { FullProfile } from '@/types/profile';
import { ProfileHeader } from '@/app/(authenticated)/my-space/profile/_utils/components/profile-header';

interface ProfileViewProps {
  profile: FullProfile;
  hasFullAccess?: boolean;
}

export function ProfileView({ profile, hasFullAccess = false }: ProfileViewProps) {
  return <ProfileHeader profile={profile} />;
}
