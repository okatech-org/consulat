import { getProfileById } from '@/actions/profiles';
import { auth } from '@/next-auth';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileDetailsView } from './profile-details-view';
import {
  getServiceRequestsByProfileId,
  getUserFullProfileById,
} from '@/lib/user/getters';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const awaitedParams = await params;
  const profileId = awaitedParams.id;
  const profile = await getProfileById(profileId);

  if (!profile) {
    return {
      title: 'Profil non trouvé',
    };
  }

  return {
    title: `${profile.firstName} ${profile.lastName} | Consulat.ga`,
    description: `Profil consulaire de ${profile.firstName} ${profile.lastName}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const awaitedParams = await params;
  const profileId = awaitedParams.id;
  const session = await auth();

  const profile = await getUserFullProfileById(profileId);

  if (!profile) {
    notFound();
  }

  // Determine if the user has full access to this profile
  const hasFullAccess =
    session?.user?.roles?.includes('SUPER_ADMIN') ||
    (session?.user?.roles?.some((role: string) =>
      ['ADMIN', 'MANAGER', 'AGENT'].includes(role),
    ) &&
      session?.user?.countryCode === profile.residenceCountyCode);

  // Determine if the user can contact this profile
  const canContact = !!session?.user;

  const requests = hasFullAccess
    ? await getServiceRequestsByProfileId(profileId)
    : undefined;

  return (
    <div className="container">
      <div className="mx-auto max-w-screen-xl">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileDetailsView
            profile={profile}
            hasFullAccess={hasFullAccess ?? false}
            canContact={canContact}
            requests={requests}
          />
        </Suspense>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
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
  );
}
