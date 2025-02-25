import { CountryWithCount, getCountries } from '@/actions/countries';
import { getTranslations } from 'next-intl/server';
import { CountriesList } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/countries-list';
import { CreateCountryButton } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/create-country-button';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { tryCatch } from '@/lib/utils';

export default async function CountriesPage() {
  const t = await getTranslations('sa.countries');
  const { data: countries, error } = await tryCatch<CountryWithCount[]>(getCountries());

  return (
    <PageContainer title={t('title')} action={<CreateCountryButton />}>
      <CardContainer>
        {error ? (
          <div className="text-destructive">{t('messages.error.fetch')}</div>
        ) : (
          <CountriesList countries={countries ?? []} />
        )}
      </CardContainer>
    </PageContainer>
  );
}
