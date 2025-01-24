import { Suspense } from 'react';
import { getProfiles } from '@/app/(authenticated)/admin/_utils/actions/profiles';
import { ProfilesTable } from '@/app/(authenticated)/admin/_utils/profiles/profiles-table';
import { ProfilesFilters } from '@/app/(authenticated)/admin/_utils/profiles/profiles-filters';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { RequestStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';

interface ProfilesPageProps {
  searchParams: {
    q?: string;
    status?: RequestStatus;
  };
}

export default async function ProfilesPage({ searchParams }: ProfilesPageProps) {
  const t_profiles = await getTranslations('actions.profiles');
  const profilesResult = await getProfiles({
    search: searchParams.q,
    status: searchParams.status as RequestStatus | undefined,
  });

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t_profiles('title')}</h1>
        <p className="text-muted-foreground">{t_profiles('description')}</p>
      </div>

      <ProfilesFilters />

      <Suspense
        key={`${searchParams.q}-${searchParams.status}`}
        fallback={<LoadingSkeleton />}
      >
        <ProfilesTable profiles={profilesResult.profiles} />
      </Suspense>
    </div>
  );
}
