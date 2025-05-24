import { getTranslations } from 'next-intl/server';
import { getOrganizations } from '@/actions/organizations';
import { ServicesTable } from '@/components/organization/services-table';
import { getServices } from '../(superadmin)/_utils/actions/services';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';
import { getCountries } from '@/actions/countries';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export default async function ServicesPage() {
  const [
    { data: services, error: servicesError },
    { data: organizations, error: organizationsError },
    { data: countries, error: countriesError },
  ] = await Promise.all([
    tryCatch(getServices()),
    tryCatch(getOrganizations()),
    tryCatch(getCountries()),
  ]);

  const t = await getTranslations('services');

  return (
    <PageContainer
      title={t('title')}
      action={
        <Button asChild>
          <Link href={ROUTES.dashboard.services_new}>
            <Plus className="size-icon" />
            <span className={'hidden sm:inline'}>{t('actions.create')}</span>
          </Link>
        </Button>
      }
    >
      {servicesError || organizationsError || countriesError ? (
        <div className="text-destructive">{t('messages.error.fetch')}</div>
      ) : (
        <ServicesTable
          services={services ?? []}
          organizations={organizations ?? []}
          countries={countries ?? []}
        />
      )}
    </PageContainer>
  );
}
