import { redirect } from 'next/navigation';
import { ServiceCategory, UserRole } from '@prisma/client';
import { ServiceCategorySelector } from '@/components/organization/service-category-selector';
import { NewServiceForm } from '@/components/organization/new-service-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth/utils';
import { hasAnyRole } from '@/lib/permissions/utils';

import {
  getOrganizations,
  getOrganizationWithSpecificIncludes,
} from '@/actions/organizations';
import CardContainer from '@/components/layouts/card-container';
import { api } from '@/trpc/server';

interface ServiceCreationPageProps {
  searchParams: Promise<{ category: ServiceCategory }>;
}

export default async function ServiceCreationPage({
  searchParams,
}: ServiceCreationPageProps) {
  const t = await getTranslations();
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.auth.login);
  }
  const isSuperAdmin = hasAnyRole(user, [UserRole.SUPER_ADMIN]);
  const countries = await api.countries.getActive();
  const organizations = await getOrganizations();
  const organization = !isSuperAdmin
    ? await getOrganizationWithSpecificIncludes(user.organizationId ?? '', ['countries'])
    : null;
  const awaitedParams = await searchParams;
  const selectedCategory = awaitedParams.category;

  return (
    <PageContainer
      title={t('services.form.create_title')}
      description={
        selectedCategory
          ? t(`inputs.serviceCategory.options.${selectedCategory}`)
          : t('services.category_selector.subtitle')
      }
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={
              selectedCategory ? ROUTES.dashboard.services_new : ROUTES.dashboard.services
            }
          >
            <ArrowLeft className="size-icon" />
            {selectedCategory
              ? t('services.actions.backToCategorySelector')
              : t('services.actions.backToServices')}
          </Link>
        </Button>
      }
    >
      {selectedCategory ? (
        <CardContainer>
          <NewServiceForm
            initialData={{
              category: selectedCategory,
              ...(organization ? { organizationId: organization.id } : {}),
            }}
            organizations={
              isSuperAdmin ? organizations : organization ? [organization] : []
            }
            countries={isSuperAdmin ? countries : (organization?.countries ?? [])}
          />
        </CardContainer>
      ) : (
        <ServiceCategorySelector />
      )}
    </PageContainer>
  );
}
