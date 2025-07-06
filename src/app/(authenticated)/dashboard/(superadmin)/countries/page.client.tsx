'use client';

import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/layouts/page-container';
import CardContainer from '@/components/layouts/card-container';
import { CountriesList } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/countries-list';
import { CreateCountryButton } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/components/create-country-button';
import { useCountries, useCountriesStats } from '@/hooks/use-countries';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function CountriesPageClient() {
  const t = useTranslations('sa.countries');

  // Utiliser les hooks tRPC
  const { countries, isLoading, isError, error, refetch } = useCountries();

  const { stats, isLoading: isLoadingStats } = useCountriesStats();

  // Gestion des erreurs
  if (isError) {
    return (
      <PageContainer title={t('title')}>
        <CardContainer>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || t('messages.error.fetch')}
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => refetch()} variant="outline">
              {t('actions.retry')}
            </Button>
          </div>
        </CardContainer>
      </PageContainer>
    );
  }

  // Affichage du loading
  if (isLoading) {
    return (
      <PageContainer title={t('title')} action={<CreateCountryButton />}>
        <CardContainer>
          <LoadingSkeleton />
        </CardContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={t('title')} action={<CreateCountryButton />}>
      <CardContainer>
        {!isLoadingStats && stats && (
          <div className="mb-4 text-sm text-muted-foreground">
            {stats.totalCountries} pays total • {stats.activeCountries} actifs •{' '}
            {stats.inactiveCountries} inactifs
          </div>
        )}
        <CountriesList countries={countries} isLoading={isLoading} />
      </CardContainer>
    </PageContainer>
  );
}
