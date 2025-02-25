import { ServiceEditForm } from '@/components/organization/service-edit-form';
import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';
import { getFullService } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import { getOrganizations } from '@/actions/organizations';
import NotFound from 'next/dist/client/components/not-found-error';
import { tryCatch } from '@/lib/utils';

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const [
    { data: service, error: serviceError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([
    tryCatch(getFullService(params.id)),
    tryCatch(getOrganizations()),
  ]);
  const t = await getTranslations('services');

  if (serviceError) {
    return <div>Error: {`${serviceError.cause}`}</div>;
  }

  if (organizationsError) {
    return <div>Error: {`${organizationsError.cause}`}</div>;
  }

  if (!service) {
    return <NotFound />;
  }

  return (
    <div className="container h-full space-y-6">
      <CardContainer
        title={
          <span>
            {t('edit_title')} - {service.name}
          </span>
        }
      >
        <ServiceEditForm service={service} organizations={organizations ?? []} />
      </CardContainer>
    </div>
  );
}
