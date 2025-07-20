'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { RequestOverview } from '../_components/request-overview';
import RequestReview from '../_components/request-review';
import { api } from '@/trpc/react';
import { PageContainer } from '@/components/layouts/page-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NotFoundComponent } from '@/components/ui/not-found';
import type { RequestDetails } from '@/server/api/routers/requests/types';

export default function ViewRequest() {
  const searchParams = useSearchParams();
  const review = searchParams.get('review');
  const { id } = useParams();

  const { data: request, isLoading } = api.requests.getById.useQuery({
    id: id as string,
  });

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  if (!isLoading && !request) {
    return (
      <NotFoundComponent description="La demande que vous cherchez n'existe pas ou vous n'avez pas les permissions pour la voir." />
    );
  }

  if (review) {
    return <RequestReview request={request as NonNullable<RequestDetails>} />;
  }

  return (
    <PageContainer>
      <RequestOverview request={request as NonNullable<RequestDetails>} />
    </PageContainer>
  );
}

function PageLoadingSkeleton() {
  return (
    <PageContainer>
      <LoadingSkeleton variant="grid" columns={2} rows={2} />
    </PageContainer>
  );
}
