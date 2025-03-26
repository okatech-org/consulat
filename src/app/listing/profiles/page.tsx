import { Suspense } from 'react';
import { getPublicProfiles } from '@/actions/profiles';
import { Skeleton } from '@/components/ui/skeleton';
import { Metadata } from 'next';
import { PageContainer } from '@/components/layouts/page-container';
import ProfilesList from './_components/profiles-list';

export const metadata: Metadata = {
  title: 'Profiles Consulaires | Consulat.ga',
  description: 'Liste des profiles consulaires accessibles publiquement',
};

export default async function ProfilesListPage() {
  return (
    <PageContainer
      title="Profiles Consulaires"
      description="Liste des profiles consulaires accessibles publiquement"
      className="container py-8 max-w-screen-xl"
    >
      <Suspense fallback={<ProfilesListSkeleton />}>
        <ProfilesListComponent />
      </Suspense>
    </PageContainer>
  );
}

async function ProfilesListComponent() {
  const profiles = await getPublicProfiles();

  return <ProfilesList profiles={profiles} />;
}

function ProfilesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg flex flex-col gap-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
