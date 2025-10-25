'use client';

import { useParams } from 'next/navigation';
import RequestReview from '../_components/request-review';
import { PageContainer } from '@/components/layouts/page-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NotFoundComponent } from '@/components/ui/not-found';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export default function ViewRequest() {
  const { id } = useParams<{ id: Id<'requests'> }>();

  const request = useQuery(api.functions.request.getRequest, {
    requestId: id,
  });

  if (request === undefined) {
    return <PageLoadingSkeleton />;
  }

  if (request === null) {
    return (
      <NotFoundComponent description="La demande que vous cherchez n'existe pas ou vous n'avez pas les permissions pour la voir." />
    );
  }

  return (
    <PageContainer>
      <RequestReview request={request} />
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
