'use client';

import { PageContainer } from '@/components/layouts/page-container';
import ProfilesList from './_components/profiles-list';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ProfileStatus } from '@/convex/lib/constants';

export default function ProfilesListPageClient() {
  const data = useQuery(api.functions.profile.getProfilesListEnriched, {
    status: [ProfileStatus.Active],
  });

  if (data === undefined) {
    return (
      <PageContainer
        title="Profiles Consulaires"
        description="Liste des profiles consulaires accessibles publiquement"
        className="container py-8 max-w-screen-xl"
      >
        <LoadingSkeleton variant="grid" rows={4} columns={3} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Profiles Consulaires"
      description="Liste des profiles consulaires accessibles publiquement"
      className="container py-8 max-w-screen-xl"
    >
      <ProfilesList profiles={data.items} />
    </PageContainer>
  );
}
