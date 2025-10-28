'use client';

import CardContainer from '@/components/layouts/card-container';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { CountryForm } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/country-form';
import { PageContainer } from '@/components/layouts/page-container';
import { NotFoundComponent } from '@/components/ui/not-found';
import { useTranslations } from 'next-intl';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import type { Id } from '@/convex/_generated/dataModel';

export default function CountryDetails() {
  const params = useParams<{ id: Id<'countries'> }>();
  const t = useTranslations('sa.countries');

  const country = useQuery(
    api.functions.country.getCountry,
    params.id ? { countryId: params.id } : 'skip',
  );

  if (country === undefined) {
    return (
      <PageContainer title={t('form.edit_title')}>
        <LoadingSkeleton variant="grid" rows={3} columns={2} />
      </PageContainer>
    );
  }

  if (country === null) {
    return <NotFoundComponent />;
  }

  return (
    <PageContainer
      title={
        <span>
          {t('form.edit_title')} - {country.name}
        </span>
      }
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <CardContainer>
          <CountryForm initialData={country} />
        </CardContainer>
      </Suspense>
    </PageContainer>
  );
}
