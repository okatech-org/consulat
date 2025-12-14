'use client';

import { useParams, useRouter } from 'next/navigation';
import { ProfileView } from '../_components/profile-view';
import { ChildProfileView } from '../_components/child-profile-view';
import { ProfileContactForm } from '../_components/profile-contact-form';
import { PageContainer } from '@/components/layouts/page-container';
import { useCurrentUser } from '@/hooks/use-current-user';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import type { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserRole } from '@/convex/lib/constants';
import type { CompleteChildProfile, CompleteProfile } from '@/convex/lib/types';
import { hasAnyRole } from '@/lib/permissions/utils';

export default function ProfilePage() {
  const params = useParams<{ id: Id<'profiles'> }>();
  const router = useRouter();
  const { user } = useCurrentUser();

  const profileId = useQuery(api.functions.profile.getProfilIdFromPublicId, {
    publicId: params.id,
  });

  const isChildProfile = useQuery(
    api.functions.childProfile.isChildProfile,
    profileId
      ? {
          childProfileId: profileId as string,
        }
      : 'skip',
  );

  const data = useQuery(
    api.functions.profile.getCompleteProfileById,
    profileId && !isChildProfile ? { profileId: profileId as Id<'profiles'> } : 'skip',
  );

  const childProfile = useQuery(
    api.functions.childProfile.getCurrentChildProfile,
    profileId && isChildProfile
      ? {
          childProfileId: profileId as Id<'childProfiles'>,
        }
      : 'skip',
  );

  if (
    (isChildProfile && childProfile === undefined) ||
    (!isChildProfile && data === undefined)
  ) {
    return (
      <PageContainer
        title={`Profile Consulaires publique`}
        className="container py-8 max-w-screen-xl"
      >
        <LoadingSkeleton variant="form" />
      </PageContainer>
    );
  }

  if ((isChildProfile && childProfile === null) || (!isChildProfile && data === null)) {
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

  return (
    <PageContainer
      title={`Profile Consulaires publique`}
      className="container py-8 max-w-screen-xl"
    >
      <ProfileDetailsView
        profile={data}
        childProfile={childProfile}
        hasFullAccess={hasFullAccess ?? false}
      />
    </PageContainer>
  );
}

interface ProfileDetailsViewProps {
  profile: CompleteProfile | null | undefined;
  childProfile?: CompleteChildProfile | null | undefined;
  hasFullAccess: boolean;
}

export function ProfileDetailsView({
  profile,
  childProfile,
  hasFullAccess,
}: ProfileDetailsViewProps) {
  const { user } = useCurrentUser();

  if (!profile && !childProfile) {
    return null;
  }

  if (childProfile) {
    return (
      <>
        <ChildProfileView
          profile={childProfile}
          hasFullAccess={hasFullAccess}
          showRequests={true}
        />
      </> 
    );
  }

  if (profile) {
    return (
      <>
        <ProfileView
          profile={profile}
          hasFullAccess={hasFullAccess}
          showRequests={true}
        />

        {user && (
          <div className="mt-8">
            <ProfileContactForm
              userId={user._id}
              recipientEmail={profile.contacts?.email ?? ''}
              recipientName={`${profile.personal?.firstName} ${profile.personal?.lastName}`}
            />
          </div>
        )}
      </>
    );
  }
}
