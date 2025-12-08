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
import { hasAnyRole } from '@/lib/permissions/utils';

export default function ProfilePage() {
  const params = useParams<{ id: Id<'profiles'> }>();

  const profileId = useQuery(api.functions.profile.getProfilIdFromPublicId, {
    publicId: params.id,
  });

  const data = useQuery(
    api.functions.profile.getCurrentProfile,
    profileId ? { profileId } : 'skip',
  );

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

  const hasFullAccess = hasAnyRole(user, [
    UserRole.SuperAdmin,
    UserRole.Admin,
    UserRole.Manager,
    UserRole.Agent,
    UserRole.IntelAgent,
  ]);

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
  if (!profile) {
    return null;
  }

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
