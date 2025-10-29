'use client';

import { useSearchParams } from 'next/navigation';
import { ServiceCategory, UserRole } from '@/convex/lib/constants';
import { ServiceCategorySelector } from '@/components/organization/service-category-selector';
import { NewServiceForm } from '@/components/organization/new-service-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PageContainer } from '@/components/layouts/page-container';
import { ROUTES } from '@/schemas/routes';
import { useTranslations } from 'next-intl';
import { hasAnyRole } from '@/lib/permissions/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useActiveCountries } from '@/hooks/use-countries';
import { useOrganizations } from '@/hooks/use-organizations';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import CardContainer from '@/components/layouts/card-container';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { Id } from '@/convex/_generated/dataModel';

export default function ServiceCreationPage() {
  const searchParams = useSearchParams();
  const selectedCategory = (searchParams.get('category') as ServiceCategory) || undefined;
  const t = useTranslations();
  const { user, loading: userLoading } = useCurrentUser();
  const { countries, isLoading: countriesLoading } = useActiveCountries();
  const { organizations, isLoading: organizationsLoading } = useOrganizations();

  const isSuperAdmin = user ? hasAnyRole(user, [UserRole.SuperAdmin]) : false;

  const organization = useQuery(
    api.functions.organization.getOrganization,
    !isSuperAdmin && user?.membership?.organizationId
      ? { organizationId: user.membership.organizationId as Id<'organizations'> }
      : 'skip',
  );

  const organizationCountries = useQuery(
    api.functions.country.getAllCountries,
    organization?.countryCodes && organization.countryCodes.length > 0
      ? { status: undefined }
      : 'skip',
  );

  const enrichedOrganization =
    organization && organizationCountries
      ? {
          ...organization,
          countries: organizationCountries.filter((country) =>
            organization.countryCodes?.includes(country.code),
          ),
        }
      : null;

  if (userLoading || countriesLoading || organizationsLoading) {
    return (
      <PageContainer
        title={t('services.form.create_title')}
        description={t('services.category_selector.subtitle')}
      >
        <LoadingSkeleton variant="card" count={3} />
      </PageContainer>
    );
  }

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
              ...(enrichedOrganization
                ? { organizationId: enrichedOrganization._id }
                : {}),
            }}
            organizations={
              isSuperAdmin
                ? organizations
                : enrichedOrganization
                  ? [enrichedOrganization]
                  : []
            }
            countries={isSuperAdmin ? countries : (enrichedOrganization?.countries ?? [])}
          />
        </CardContainer>
      ) : (
        <ServiceCategorySelector />
      )}
    </PageContainer>
  );
}
