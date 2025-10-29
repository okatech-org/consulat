'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProfileView } from '../_components/profile-view';
import { ProfileContactForm } from '../_components/profile-contact-form';
import { PageContainer } from '@/components/layouts/page-container';
import { useCurrentUser } from '@/hooks/use-current-user';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserRole } from '@/convex/lib/constants';
import type { CompleteProfile } from '@/convex/lib/types';

export default function ProfilePage() {
  const params = useParams<{ id: Id<'profiles'> }>();
  const data = useQuery(api.functions.profile.getCurrentProfile, {
    profileId: params.id,
  });
  const { user } = useCurrentUser();
  const router = useRouter();

  if (data === undefined) {
    return (
      <PageContainer
        title={`Profile Consulaires publique`}
        className="container py-8 max-w-screen-xl"
      >
        <LoadingSkeleton variant="form" />
      </PageContainer>
    );
  }

  if (data === null) {
    return (
      <PageContainer
        title={`Profile Consulaires publique`}
        className="container py-8 max-w-screen-xl flex flex-col items-center justify-center gap-4"
      >
        <p>Profile non trouvé ou non accessible publiquement</p>
        <Button
          variant="outline"
          onClick={() => {
            router.push('/listing/profiles');
          }}
        >
          Retour à la liste des profiles
        </Button>
      </PageContainer>
    );
  }

  const hasFullAccess =
    user?.roles?.includes(UserRole.SuperAdmin) ||
    (user?.roles?.some((role) =>
      [UserRole.Admin, UserRole.Manager, UserRole.Agent].includes(role),
    ) &&
      user?.countryCode === data.residenceCountry);

  const canContact = !!user;

  return (
    <PageContainer
      title={`Profile Consulaires publique`}
      className="container py-8 max-w-screen-xl"
    >
      <ProfileDetailsView
        profile={data}
        hasFullAccess={hasFullAccess ?? false}
        canContact={canContact}
        requests={requests}
      />
    </PageContainer>
  );
}

interface ProfileDetailsViewProps {
  profile: CompleteProfile;
  hasFullAccess: boolean;
  canContact: boolean;
}

export function ProfileDetailsView({
  profile,
  hasFullAccess,
  canContact,
}: ProfileDetailsViewProps) {
  return (
    <>
      <ProfileView profile={profile} hasFullAccess={hasFullAccess} showRequests={true} />

      {canContact && (
        <div className="mt-8">
          <ProfileContactForm
            userId={profile.userId}
            recipientEmail={profile.contacts?.email ?? ''}
            recipientName={`${profile.personal?.firstName} ${profile.personal?.lastName}`}
          />
        </div>
      )}
    </>
  );
}
