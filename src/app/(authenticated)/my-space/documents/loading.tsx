'use client';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageContainer } from '@/components/layouts/page-container';

export default function LoadingPage() {
  return (
    <PageContainer>
      <LoadingSkeleton variant="grid" />
    </PageContainer>
  );
}
