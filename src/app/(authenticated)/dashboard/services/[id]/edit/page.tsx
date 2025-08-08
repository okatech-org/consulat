import { getTranslations } from 'next-intl/server';
import { getFullService } from '@/app/(authenticated)/dashboard/(superadmin)/_utils/actions/services';
import {
  getOrganizations,
  getOrganizationWithSpecificIncludes,
} from '@/actions/organizations';
import { NotFoundComponent } from '@/components/ui/not-found';
import { ConsularServiceForm } from '@/components/organization/service-edit-form';
import { PageContainer } from '@/components/layouts/page-container';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { UserRole } from '@prisma/client';
import { getCountries } from '@/actions/countries';
import { getCurrentUser } from '@/actions/user';
import { hasAnyRole } from '@/lib/permissions/utils';
import { getDocumentTemplates } from '@/actions/document-generation';

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
  const documentTemplates = await getDocumentTemplates(
    isSuperAdmin ? null : (user.organizationId ?? ''),
  );

  const service = await getFullService(awaitedParams.id);

  if (!service) {
    return <NotFoundComponent />;
  }

  return (
    <PageContainer title={service.name} description={t('edit_title')}>
      <ConsularServiceForm
        service={service}
        organizations={organizations ?? [organization]}
        countries={countries ?? organization?.countries ?? []}
        documentTemplates={documentTemplates}
      />
    </PageContainer>
  );
}
