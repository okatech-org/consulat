import { ServerRoleGuard } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/lib/auth/utils';
import type { SessionUser } from '@/types/user';
import { ProfileIntelligenceDetailsPage } from './_components/profile-intelligence-details-page';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  return (
    <ServerRoleGuard roles={['INTEL_AGENT']} user={user as SessionUser}>
      <ProfileIntelligenceDetailsPage profileId={id} />
    </ServerRoleGuard>
  );
}
