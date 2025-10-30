'use client';

import { RoleGuard } from '@/lib/permissions/utils';
import { ProfileIntelligenceDetailsPage } from './_components/profile-intelligence-details-page';
import { UserRole } from '@/convex/lib/constants';
import { use } from 'react';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = use(params);

  return (
    <RoleGuard roles={[UserRole.IntelAgent]}>
      <ProfileIntelligenceDetailsPage profileId={id} />
    </RoleGuard>
  );
}
