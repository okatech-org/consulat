import { ServerRoleGuard } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';
import type { SessionUser } from '@/types/user';
import { ProfileIntelligenceDetailsPage } from './_components/profile-intelligence-details-page';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getCurrentUser();

  return (
    <ServerRoleGuard roles={['INTEL_AGENT']} user={user as SessionUser}>
      <ProfileIntelligenceDetailsPage profileId={params.id} />
    </ServerRoleGuard>
  );
}
