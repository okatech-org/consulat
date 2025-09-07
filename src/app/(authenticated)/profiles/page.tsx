import { ServerRoleGuard } from '@/lib/permissions/utils';
import { getCurrentUser } from '@/actions/user';
import type { SessionUser } from '@/types/user';
import { ProfilesIntelligencePage } from './_components/profiles-intelligence-page';

export default async function ProfilesPage() {
  const user = await getCurrentUser();

  return (
    <ServerRoleGuard roles={['INTEL_AGENT']} user={user as SessionUser}>
      <ProfilesIntelligencePage />
    </ServerRoleGuard>
  );
}
