import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import ProfilePageCLient from './page.client';

export default async function ProfilePage() {
  const session = await auth();
  const profile = await api.profile.getCurrent();

  const registrationRequest = await api.profile.getRegistrationRequest({
    profileId: session?.user?.profileId ?? '',
  });

  return (
    <ProfilePageCLient profile={profile} registrationRequest={registrationRequest} />
  );
}
