import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { CountriesList } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/countries-list';
import { CreateCountryButton } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/create-country-button';
import { getTranslations } from 'next-intl/server';

export default async function CountriesPage() {
  const t = await getTranslations('sa.countries');

  return (
    <PageContainer title={t('title')} action={<CreateCountryButton />}>
      <CardContainer>
        <CountriesList />
      </CardContainer>
    </PageContainer>
  );
}
