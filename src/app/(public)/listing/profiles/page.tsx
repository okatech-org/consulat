'use client';

import { usePublicProfiles } from '@/hooks/use-public-profiles';
import { PageContainer } from '@/components/layouts/page-container';
import ProfilesList from './_components/profiles-list';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { ProfilesListItem } from '@/server/api/routers/profiles/types';

export default function ProfilesListPageClient() {
  const { data: profiles, error, refetch, isLoading } = usePublicProfiles();

  if (isLoading) {
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

  if (error) {
    return (
      <PageContainer
        title="Profiles Consulaires"
        description="Liste des profiles consulaires accessibles publiquement"
        className="container py-8 max-w-screen-xl"
      >
        <div className="text-center py-10">
          <p className="text-destructive mb-4">Erreur lors du chargement des profils</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Profiles Consulaires"
      description="Liste des profiles consulaires accessibles publiquement"
      className="container py-8 max-w-screen-xl"
    >
      <ProfilesList profiles={(profiles?.items as ProfilesListItem[]) || []} />
    </PageContainer>
  );
}
