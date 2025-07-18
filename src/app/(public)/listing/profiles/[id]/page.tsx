'use client';

import { usePublicProfile } from '@/hooks/use-public-profiles';
import { useParams, useRouter } from 'next/navigation';
import type { FullProfile } from '@/types/profile';
import { ProfileView } from '../_components/profile-view';
import { ProfileContactForm } from '../_components/profile-contact-form';
import type { ServiceRequest } from '@prisma/client';
import { PageContainer } from '@/components/layouts/page-container';
import { useCurrentUser } from '@/hooks/use-role-data';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/schemas/routes';

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(params.id);
  const { user } = useCurrentUser();
  const router = useRouter();
  if (error) {
    <PageContainer
      title={`Profile Consulaires publique`}
      className="container py-8 max-w-screen-xl flex flex-col items-center justify-center gap-4"
    >
      <p>Profile non trouvé ou non accessible publiquement</p>
      <Button
        variant="outline"
        onClick={() => {
          router.push(ROUTES.listing.profiles);
        }}
      >
        Retour à la liste des profiles
      </Button>
    </PageContainer>;
  }

  if (isLoading) {
    return (
      <PageContainer
        title={`Profile Consulaires publique`}
        className="container py-8 max-w-screen-xl"
      >
        <LoadingSkeleton variant="form" />
      </PageContainer>
    );
  }

  if (!profile) {
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
    user?.roles?.includes('SUPER_ADMIN') ||
    (user?.roles?.some((role) => ['ADMIN', 'MANAGER', 'AGENT'].includes(role)) &&
      user?.countryCode === profile.residenceCountyCode);

  const canContact = !!user;

  const requests = undefined;

  return (
    <PageContainer
      title={`Profile Consulaires publique`}
      className="container py-8 max-w-screen-xl"
    >
      <ProfileDetailsView
        profile={profile as FullProfile}
        hasFullAccess={hasFullAccess ?? false}
        canContact={canContact}
        requests={requests}
      />
    </PageContainer>
  );
}

interface ProfileDetailsViewProps {
  profile: FullProfile;
  hasFullAccess: boolean;
  canContact: boolean;
  requests?: ServiceRequest[];
}

export function ProfileDetailsView({
  profile,
  hasFullAccess,
  canContact,
  requests,
}: ProfileDetailsViewProps) {
  return (
    <>
      <ProfileView profile={profile} hasFullAccess={hasFullAccess} requests={requests} />

      {canContact && (
        <div className="mt-8">
          <ProfileContactForm
            userId={profile.userId ?? profile.user?.id ?? ''}
            recipientEmail={profile.user?.email ?? ''}
            recipientName={`${profile.firstName} ${profile.lastName}`}
          />
        </div>
      )}
    </>
  );
}
