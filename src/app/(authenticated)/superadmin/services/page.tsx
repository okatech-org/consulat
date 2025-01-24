import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';
import { getServices } from '../_utils/actions/services';
import { getOrganizations } from '@/app/(authenticated)/superadmin/_utils/actions/organizations';
import { CreateServiceButton } from '@/app/(authenticated)/superadmin/_utils/components/create-service-button';
import { ServicesTable } from '@/app/(authenticated)/superadmin/_utils/components/services-table';

export default async function ServicesPage() {
  const [
    { data: services, error: servicesError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([getServices(), getOrganizations()]);

  const t = await getTranslations('superadmin.services');

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
