import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';
import { getServices } from '../_utils/actions/services';
import { getOrganizations } from '@/actions/organizations';
import { CreateServiceButton } from '@/components/organization/create-service-button';
import { ServicesTable } from '@/components/organization/services-table';

export default async function ServicesPage() {
  const [
    { data: services, error: servicesError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([getServices(), getOrganizations()]);

  const t = await getTranslations('services');

  return (
    <div className="container space-y-6">
      <CardContainer title={<span>{t('title')}</span>} action={<CreateServiceButton />}>
        {servicesError || organizationsError ? (
          <div className="text-destructive">{t('messages.error.fetch')}</div>
        ) : (
          <ServicesTable services={services ?? []} organizations={organizations ?? []} />
        )}
      </CardContainer>
    </div>
  );
}
