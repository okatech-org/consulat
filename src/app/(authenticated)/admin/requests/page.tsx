import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { RequestsFilters } from '@/app/(authenticated)/admin/_utils/components/requests/requests-filters';
import { RequestsTable } from '@/app/(authenticated)/admin/_utils/components/requests/requests-table';

export default async function RequestsPage() {
  const t = await getTranslations('actions.requests');

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <RequestsFilters />

      <Suspense fallback={<LoadingSkeleton />}>
        <RequestsTable />
      </Suspense>
    </div>
  );
}
