import { getOrganizationById } from '@/actions/organizations';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import * as React from 'react';
import { getCurrentUser } from '@/actions/user';
import { SettingsTabs } from '@/components/organization/settings-tabs';
import { PageContainer } from '@/components/layouts/page-container';
import { getActiveCountries } from '@/actions/countries';
import { ServerRoleGuard } from '@/lib/permissions/utils';
import { UserRole } from '@prisma/client';
import { getOrganizationIdFromUser } from '@/lib/utils';

export default async function OrganizationSettingsPage() {
  const user = await getCurrentUser();
  const organizationId = getOrganizationIdFromUser(user);
  const t = await getTranslations();
  const countries = await getActiveCountries();

  if (!organizationId || !user) {
    notFound();
  }

  const { data: organization, error } = await getOrganizationById(organizationId);

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
        fallback={<div>Vous n&apos;êtes pas autorisé à accéder à cette page</div>}
      >
        <SettingsTabs
          organization={{
            ...organization,
            metadata: organization.metadata as Record<string, unknown> | null,
            countries: organization.countries ?? [],
            services: organization.services ?? [],
            agents:
              organization.agents.filter((agent) => agent.role === UserRole.AGENT) ?? [],
            managers:
              organization.agents.filter((agent) => agent.role === UserRole.MANAGER) ??
              [],
          }}
          availableCountries={countries}
        />
      </ServerRoleGuard>
    </PageContainer>
  );
}
