import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';
import ProfilePageClient from './page.client';

export const metadata: Metadata = {
  title: 'Mon Profil | Consulat.ga',
  description: 'Gérez votre profil consulaire',
};

function ProfileLoadingFallback() {
  return (
    <PageContainer>
      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-full lg:col-span-5">
          <LoadingSkeleton variant="card" aspectRatio="4/3" />
        </div>
        <div className="col-span-full lg:col-span-3">
          <LoadingSkeleton variant="card" aspectRatio="1/1" />
        </div>
      </div>
      <div className="grid grid-cols-8 gap-4 mt-4">
        <div className="col-span-full lg:col-span-5">
          <LoadingSkeleton variant="card" aspectRatio="16/9" />
        </div>
        <div className="col-span-full lg:col-span-3 space-y-4">
          <LoadingSkeleton variant="card" aspectRatio="4/3" />
          <LoadingSkeleton variant="card" aspectRatio="4/3" />
        </div>
      </div>
    </PageContainer>
  );
}

interface ProfilePageProps {
  searchParams: Promise<{
    form?: string;
  }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const searchParamsResult = await searchParams;

  return (
    <Suspense fallback={<ProfileLoadingFallback />}>
      <ProfilePageClient searchParams={searchParamsResult} />
    </Suspense>
  );
}
