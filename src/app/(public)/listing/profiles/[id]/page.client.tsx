'use client';

import { usePublicProfile } from '@/hooks/use-public-profiles';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/react';
import type { FullProfile } from '@/types/profile';
import { ProfileView } from '../_components/profile-view';
import { ProfileContactForm } from '../_components/profile-contact-form';
import type { ServiceRequest } from '@prisma/client';
import { PageContainer } from '@/components/layouts/page-container';

interface ProfilePageClientProps {
  profileId: string;
}

export default function ProfilePageClient({ profileId }: ProfilePageClientProps) {
  const { data: profile, isLoading, error } = usePublicProfile(profileId);
  const { data: currentUser } = api.user.getCurrentUser.useQuery(undefined, {
    retry: false,
  });

  if (error) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="mx-auto max-w-screen-xl">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  const hasFullAccess =
    currentUser?.roles?.includes('SUPER_ADMIN') ||
    (currentUser?.roles?.some((role) => ['ADMIN', 'MANAGER', 'AGENT'].includes(role)) &&
      currentUser?.countryCode === profile.residenceCountyCode);

  const canContact = !!currentUser;

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
