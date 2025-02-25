import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';
import { getOrganizations } from '@/actions/organizations';
import { CreateServiceButton } from '@/components/organization/create-service-button';
import { ServicesTable } from '@/components/organization/services-table';
import { getServices } from '../(superadmin)/_utils/actions/services';
import { PageContainer } from '@/components/layouts/page-container';
import { tryCatch } from '@/lib/utils';

export default async function ServicesPage() {
  const [
    { data: services, error: servicesError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([tryCatch(getServices()), tryCatch(getOrganizations())]);

  const t = await getTranslations('services');

  return (
    <PageContainer title={t('title')} action={<CreateServiceButton />}>
      <CardContainer>
        {servicesError || organizationsError ? (
          <div className="text-destructive">{t('messages.error.fetch')}</div>
        ) : (
          <ServicesTable services={services ?? []} organizations={organizations ?? []} />
        )}
      </CardContainer>
    </PageContainer>
  );
}
