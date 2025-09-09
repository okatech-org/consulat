'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';

export default function LoadingPage() {
  return (
    <PageContainer title="Tableau de bord">
      <LoadingSkeleton variant="grid" columns={2} rows={2} aspectRatio="4/3" />
    </PageContainer>
  );
}
