'use client';

import { PageContainer } from '@/components/layouts/page-container';
import { RequestsHistory } from '../_components/requests-history';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function HistoryPage() {
  const { user } = useCurrentUser();
  const requests = useQuery(
    api.functions.request.getAllRequests,
    user?.profileId ? { profileId: user.profileId } : 'skip',
  );

  if (requests === undefined) {
    return (
      <PageContainer
        title="Historique des demandes"
        description="Retrouvez toutes vos demandes passées et en cours"
      >
        <LoadingSkeleton variant="list" count={5} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Historique des demandes"
      description="Retrouvez toutes vos demandes passées et en cours"
      action={
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.user.dashboard}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
      }
    >
      <RequestsHistory requests={requests} />
    </PageContainer>
  );
}
