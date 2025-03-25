import { getTranslations } from 'next-intl/server';
import CardContainer from '@/components/layouts/card-container';
import { getFullService } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import {
  getOrganizations,
  getOrganizationWithSpecificIncludes,
} from '@/actions/organizations';
import NotFound from 'next/dist/client/components/not-found-error';
import { ConsularServiceForm } from '@/components/organization/service-edit-form';
import { PageContainer } from '@/components/layouts/page-container';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { UserRole } from '@prisma/client';
import { getCountries } from '@/actions/countries';
import { getCurrentUser } from '@/actions/user';
import { hasAnyRole } from '@/lib/permissions/utils';
import { getValuable } from '@/lib/utils';
export default async function EditServicePage({ params }: { params: { id: string } }) {
  const awaitedParams = await params;
  const t = await getTranslations('services');
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.auth.login);
  }
  const isSuperAdmin = hasAnyRole(user, [UserRole.SUPER_ADMIN]);
  const countries = isSuperAdmin ? await getCountries() : null;
  const organizations = isSuperAdmin ? await getOrganizations() : null;
  const organization = !isSuperAdmin
    ? await getOrganizationWithSpecificIncludes(user.organizationId ?? '', ['countries'])
    : null;

  const service = await getFullService(awaitedParams.id);

  const cleanedService = getValuable(service);

  if (!service) {
    return <NotFound />;
  }

  console.log(JSON.stringify(cleanedService, null, 2));

  return (
    <PageContainer title={service.name} description={t('edit_title')}>
      <CardContainer>
        <ConsularServiceForm
          service={cleanedService}
          organizations={organizations ?? [organization]}
          countries={countries ?? organization?.countries ?? []}
        />
      </CardContainer>
    </PageContainer>
  );
}
