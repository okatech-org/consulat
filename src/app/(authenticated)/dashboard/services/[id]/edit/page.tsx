'use client';

import { useParams } from 'next/navigation';
import { NotFoundComponent } from '@/components/ui/not-found';
import { ConsularServiceForm } from '@/components/organization/service-edit-form';
import { PageContainer } from '@/components/layouts/page-container';
import { UserRole } from '@/convex/lib/constants';
import { hasAnyRole } from '@/lib/permissions/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useActiveCountries } from '@/hooks/use-countries';
import { useOrganizations } from '@/hooks/use-organizations';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useTranslations } from 'next-intl';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { Id } from '@/convex/_generated/dataModel';

export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const t = useTranslations('services');
  const { user, loading: userLoading } = useCurrentUser();
  const { countries, isLoading: countriesLoading } = useActiveCountries();
  const { organizations, isLoading: organizationsLoading } = useOrganizations();

  const isSuperAdmin = user ? hasAnyRole(user, [UserRole.SuperAdmin]) : false;

  const service = useQuery(
    api.functions.service.getService,
    serviceId ? { serviceId: serviceId as Id<'services'> } : 'skip',
  );

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

  if (userLoading || countriesLoading || organizationsLoading || service === undefined) {
    return (
      <PageContainer title={t('edit_title')} description={t('edit_title')}>
        <LoadingSkeleton variant="card" count={3} />
      </PageContainer>
    );
  }

  if (!service) {
    return <NotFoundComponent />;
  }

  return (
    <PageContainer title={service.name} description={t('edit_title')}>
      <ConsularServiceForm
        service={service}
        organizations={
          isSuperAdmin
            ? organizations
            : enrichedOrganization
              ? [enrichedOrganization]
              : []
        }
        countries={isSuperAdmin ? countries : (enrichedOrganization?.countries ?? [])}
        documentTemplates={[]}
      />
    </PageContainer>
  );
}
