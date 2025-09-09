'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';

export default function IntelLoadingPage() {
  return (
    <PageContainer title="Services de Renseignements">
      <LoadingSkeleton variant="grid" columns={2} rows={2} aspectRatio="4/3" />
    </PageContainer>
  );
}
