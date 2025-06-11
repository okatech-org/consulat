import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';
import { getCurrentUser } from '@/actions/user';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { getActiveCountries } from '@/actions/countries';
import { ServerRoleGuard } from '@/lib/permissions/utils';

export default async function OrganizationSettingsPage() {
  const user = await getCurrentUser();
  const t = await getTranslations();
  const countries = await getActiveCountries();

  if (!user?.organizationId || !user.assignedOrganizationId) {
    notFound();
  }

  const { data: organization, error } = await getOrganizationById(
    user.organizationId || user.assignedOrganizationId,
  );

  if (!organization || error) {
    notFound();
  }

  return (
    <PageContainer
      title={t('organization.title')}
      description={t('organization.settings.description')}
    >
      <ServerRoleGuard
        roles={['ADMIN', 'SUPER_ADMIN', 'MANAGER']}
        user={user}
        fallback={<div>You are not authorized to access this page</div>}
      >
        <SettingsTabs
          organization={{
            ...organization,
            metadata: organization.metadata as Record<string, unknown> | null,
            countries: organization.countries ?? [],
            services: organization.services ?? [],
            agents: organization.agents ?? [],
          }}
          availableCountries={countries}
        />
      </ServerRoleGuard>
    </PageContainer>
  );
}
