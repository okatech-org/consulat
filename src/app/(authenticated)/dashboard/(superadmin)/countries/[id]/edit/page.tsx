import { getCountryById } from '@/actions/countries';
import CardContainer from '@/components/layouts/card-container';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { getTranslations } from 'next-intl/server';
import { CountryForm } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/country-form';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { NotFoundComponent } from '@/components/ui/not-found';

export default async function CountryDetails({ params }: { params: { id: string } }) {
  const t = await getTranslations('sa.countries');

  // use async function to retrieve country data so that we do not need to fetch on client side
  const { data: country } = await tryCatch(getCountryById(params.id));

  if (!country) {
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
          {/* Afficher un message d'erreur si la récupération des données échoue */}

          <CountryForm initialData={country} />
        </CardContainer>
      </Suspense>
    </PageContainer>
  );
}
